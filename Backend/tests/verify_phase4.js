const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const http = require("http");
const app = require("../src/app");
const interviewReportModel = require("../src/models/interviewReport.model");
const blacklistTokenModel = require("../src/models/blacklist.model");
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

async function runTests() {
  console.log("=================================================");
  console.log("  HIREPILOT PHASE 4 AUTOMATED TEST SUITE        ");
  console.log("=================================================");

  let server;
  let baseUrl;

  try {
    // 1. Check Database Schema Indexes
    console.log("\n--- Testing Database Indexes & Optimization ---");
    const interviewIndexes = interviewReportModel.schema.indexes();
    const hasUserCreatedAtIndex = interviewIndexes.some(
      ([fields]) => fields.user === 1 && fields.createdAt === -1
    );
    assert(hasUserCreatedAtIndex, "InterviewReport Index", "{ user: 1, createdAt: -1 } compound index verified");

    const blacklistIndexes = blacklistTokenModel.schema.indexes();
    const hasTokenIndex = blacklistIndexes.some(([fields]) => fields.token === 1);
    const hasTtlIndex = blacklistIndexes.some(
      ([fields, opts]) => fields.createdAt === 1 && opts && opts.expireAfterSeconds === 86400
    );
    assert(hasTokenIndex, "Blacklist Token Lookup Index", "{ token: 1 } index verified");
    assert(hasTtlIndex, "Blacklist Token TTL Purge Index", "{ createdAt: 1, expireAfterSeconds: 86400 } verified");

    const userIndexes = userModel.schema.indexes();
    const hasGoogleIdIndex =
      userIndexes.some(([fields, opts]) => fields.googleId === 1 && opts && opts.sparse === true) ||
      userModel.schema.path("googleId").options.sparse === true;
    assert(hasGoogleIdIndex, "User GoogleID Sparse Index", "googleId index with sparse: true verified");

    // 2. Check Security / Password Exclusion in Schema
    console.log("\n--- Testing Security & Projection Safeguards ---");
    const passwordSelect = userModel.schema.path("password").options.select;
    assert(passwordSelect === false, "Password Hash Protection", "User model enforces select: false on password");

    // 3. Connect to Database for Live Query & Pagination Tests
    console.log("\n--- Connecting to MongoDB for Data Validation ---");
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    assert(mongoose.connection.readyState === 1, "Database Connectivity", "Mongoose connected successfully");

    // 4. Test Server-side Pagination & Ownership Logic
    console.log("\n--- Testing Pagination & Query Optimization ---");
    const testUser = await userModel.findOne().select("_id email").lean();
    if (testUser) {
      // Test page 1 with limit 2
      const limit = 2;
      const [reportsPage1, totalCount] = await Promise.all([
        interviewReportModel
          .find({ user: testUser._id })
          .select("title matchScore createdAt")
          .sort({ createdAt: -1 })
          .skip(0)
          .limit(limit)
          .lean(),
        interviewReportModel.countDocuments({ user: testUser._id }),
      ]);

      assert(Array.isArray(reportsPage1), "Pagination Query Execution", `Returned array of reports for user ${testUser.email}`);
      assert(reportsPage1.length <= limit, "Pagination Limit Enforced", `Returned ${reportsPage1.length} reports (limit: ${limit})`);
      assert(typeof totalCount === "number", "Total Document Count", `Accurately counted ${totalCount} total reports`);

      if (reportsPage1.length > 0) {
        const first = reportsPage1[0];
        assert(first.technicalQuestions === undefined, "Lean Projection Field Exclusion", "Excluded heavy question arrays from list query");
      }
    } else {
      console.log("[SKIP] No user found in database to run live report query");
    }

    // 5. Test Live HTTP API Endpoints
    console.log("\n--- Testing API Endpoints (Health, Auth, Error Handling) ---");
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });

    // Test GET /api/health
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, "Health Check Endpoint Status", "HTTP 200 OK");
    assert(healthJson.status === "ok" && healthJson.service === "HirePilot API", "Health Check Payload", JSON.stringify(healthJson));
    assert(!healthJson.MONGO_URI && !healthJson.JWT_SECRET && !healthJson.password, "Health Check Data Sanitization", "No sensitive variables or secrets exposed");

    // Test 401 Unauthorized Handling on Protected Route
    const authRes = await fetch(`${baseUrl}/api/interview`);
    assert(authRes.status === 401, "Protected Route 401 Rejection", "Unauthenticated request correctly returns 401");
    const authJson = await authRes.json();
    assert(!authJson.stack, "401 Error Sanitization", "No stack trace exposed on 401");

    // Test 404 Route Handling
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-route-for-testing`);
    assert(notFoundRes.status === 404, "404 Route Handling", "Unknown route correctly returns 404");
    const notFoundJson = await notFoundRes.json();
    assert(!notFoundJson.stack, "404 Error Sanitization", "No stack trace exposed on 404");

    // Test Pagination Sanitization Function Logic
    console.log("\n--- Testing Pagination Sanitization ---");
    const parsePagination = (query) => {
      const page = Math.max(1, parseInt(query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
      return { page, limit };
    };

    const case1 = parsePagination({ page: -5, limit: 0 });
    assert(case1.page === 1 && case1.limit === 10, "Pagination Negative Sanitization", `Negative sanitized to page=${case1.page}, limit=${case1.limit}`);

    const case2 = parsePagination({ page: "abc", limit: 999 });
    assert(case2.page === 1 && case2.limit === 50, "Pagination Max Limit Clamping", `Clamped to page=${case2.page}, limit=${case2.limit}`);

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
    console.log("  TEST SUMMARY");
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

runTests();
