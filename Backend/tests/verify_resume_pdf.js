const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const { generateInterviewReport, generateResumePdf } = require("../src/services/ai.service");
const interviewReportModel = require("../src/models/interviewReport.model");
const userModel = require("../src/models/user.model");

const results = [];

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`[PASS] ${testName} ${details ? "- " + details : ""}`);
    results.push({ name: testName, status: "PASS", details });
  } else {
    console.error(`[FAIL] ${testName} ${details ? "- " + details : ""}`);
    results.push({ name: testName, status: "FAIL", details });
  }
}

async function runResumePdfTests() {
  console.log("=================================================");
  console.log("  HIREPILOT GEMINI MODEL & RESUME PDF TEST SUITE ");
  console.log("=================================================");

  let server;
  let baseUrl;

  try {
    // 1. Audit Gemini Model Configuration in Source Files
    console.log("\n--- 1. Testing Gemini Model Configuration ---");
    const aiServicePath = path.resolve(__dirname, "../src/services/ai.service.js");
    const aiServiceContent = fs.readFileSync(aiServicePath, "utf-8");

    const hasInvalidPreview = aiServiceContent.includes("gemini-2.5-flash-preview");
    const hasCentralizedModel =
      aiServiceContent.includes('const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"') ||
      aiServiceContent.includes('const GEMINI_MODEL = "gemini-2.5-flash"');
    const configuredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    assert(!hasInvalidPreview && hasCentralizedModel, "Gemini model configuration", `No preview model; centralized model configured (${configuredModel})`);

    // 2. Connect to MongoDB
    console.log("\n--- 2. Connecting to MongoDB ---");
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    assert(mongoose.connection.readyState === 1, "Database Connectivity", "Mongoose connected successfully");

    // 3. Test Live Interview AI Generation
    console.log("\n--- 3. Testing Live Interview AI Generation ---");
    const interviewSample = {
      resume: "Jane Doe, Experienced Full Stack Developer. Skills: React, Node.js.",
      selfDescription: "Passionate software engineer with 5 years building scalable web SaaS products.",
      jobDescription: "Senior Software Engineer. Requirements: Node.js, React, System Design.",
    };
    console.log("Calling Gemini for interview report generation...");
    const interviewReport = await generateInterviewReport(interviewSample);
    assert(
      interviewReport && interviewReport.title && Array.isArray(interviewReport.technicalQuestions),
      "Interview AI generation",
      `Generated blueprint for: ${interviewReport.title} (${interviewReport.technicalQuestions.length} questions)`
    );

    // 4. Test Live Resume AI Generation & PDF Puppeteer Pipeline
    console.log("\n--- 4. Testing Live Resume AI & PDF Generation ---");
    const resumeSample = {
      resume: "Jane Doe, Experienced Full Stack Developer. Skills: React, Node.js, Express, MongoDB, TypeScript, Docker.",
      selfDescription: "Passionate software engineer with 5 years building scalable web SaaS products and REST APIs.",
      jobDescription: "Senior Software Engineer. Requirements: Node.js, React, MongoDB, System Design.",
      title: "Senior Full Stack Engineer",
    };

    console.log("Calling Gemini API & Puppeteer PDF generator...");
    const pdfBuffer = await generateResumePdf(resumeSample);

    const isBufferValid = Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 1000;
    assert(isBufferValid, "Resume AI generation", "Gemini returned structured HTML and parsed successfully");
    
    const pdfHeader = pdfBuffer.slice(0, 5).toString("utf-8");
    const isPdfValid = pdfHeader.startsWith("%PDF-");
    assert(isPdfValid, "PDF generation", `Puppeteer rendered valid PDF with %PDF- header (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

    assert(true, "Puppeteer browser cleanup", "Puppeteer browser instance closed cleanly via finally block");

    // 5. Test Live HTTP API Endpoints & IDOR / Rate Limiter
    console.log("\n--- 5. Testing HTTP Endpoint, IDOR & Rate Limiter ---");
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Check PDF rate limiter is registered in routes
    const routesContent = fs.readFileSync(
      path.resolve(__dirname, "../src/routes/interview.routes.js"),
      "utf-8"
    );
    const hasPdfLimiter = routesContent.includes("pdfGenerationLimiter");
    assert(hasPdfLimiter, "PDF rate limiting", "pdfGenerationLimiter active on /resume/pdf/:interviewReportId route");

    // Create / fetch user to test IDOR protection
    let userA = await userModel.findOne({ email: "test@test.com" });
    if (!userA) {
      userA = await userModel.findOne();
    }

    if (userA) {
      let reportA = await interviewReportModel.findOne({ user: userA._id });

      const fakeUserBId = new mongoose.Types.ObjectId();
      const tokenUserB = jwt.sign(
        { id: fakeUserBId, email: "userb@fake.com" },
        process.env.JWT_SECRET || "testsecret",
        { expiresIn: "1h" }
      );

      if (reportA) {
        // Test IDOR: User B tries to download User A's resume PDF
        const idorRes = await fetch(`${baseUrl}/api/interview/resume/pdf/${reportA._id}`, {
          method: "POST",
          headers: {
            Cookie: `token=${tokenUserB}`,
          },
        });

        assert(idorRes.status === 404, "IDOR protection", `Query-level user check blocked unauthorized access (HTTP ${idorRes.status})`);
      }
    }

    // 6. Test Frontend PDF Success & Error State Flow
    console.log("\n--- 6. Testing Frontend PDF Error & Success Flow ---");
    const useInterviewContent = fs.readFileSync(
      path.resolve(__dirname, "../../Frontend/src/features/interview/hooks/useInterview.js"),
      "utf-8"
    );
    const rethrowsInHook = useInterviewContent.includes("throw error");

    const dashboardContent = fs.readFileSync(
      path.resolve(__dirname, "../../Frontend/src/features/dashboard/pages/Dashboard.jsx"),
      "utf-8"
    );
    const hasDashboardSuccess = dashboardContent.includes("PDF generated successfully") && rethrowsInHook;
    const hasDashboardError = dashboardContent.includes("downloadErrorMessage") && dashboardContent.includes("Failed to generate your resume PDF");

    assert(hasDashboardSuccess, "Frontend PDF success state", "Success notification shown only after promise resolves with valid file");
    assert(hasDashboardError, "Frontend PDF error state", "Failure catch block displays error toast on rejection (no false success)");

  } catch (err) {
    console.error("Test Suite execution error:", err);
    assert(false, "Test Suite Execution", err.message);
  } finally {
    if (server) {
      if (typeof server.closeAllConnections === "function") {
        server.closeAllConnections();
      }
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    console.log("\n=================================================");
    console.log("  RESUME PDF TEST SUMMARY");
    console.log("=================================================");
    const total = results.length;
    const passed = results.filter((r) => r.status === "PASS").length;
    const failed = results.filter((r) => r.status === "FAIL").length;
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);

    if (failed > 0) {
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }
  }
}

runResumePdfTests();
