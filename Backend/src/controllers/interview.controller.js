const pdfParse = require("pdf-parse");
const {generateInterviewReport, generateResumePdf} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description
 */
async function generateInterviewReportController(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        message: "Resume file (PDF) is required to generate interview report",
      });
    }

    let resumeText = "";
    try {
      const parsed = await new pdfParse.PDFParse(
        Uint8Array.from(req.file.buffer),
      ).getText();
      resumeText = parsed?.text || "";
    } catch (parseErr) {
      console.error("Error parsing PDF resume:", parseErr);
      return res.status(400).json({
        message: "Invalid or corrupted PDF file. Please upload a valid PDF document.",
      });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({
        message: "Could not extract readable text from the uploaded PDF resume.",
      });
    }

    const { selfDescription = "", jobDescription = "" } = req.body;

    const interviewReportByAi = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    });

    // Ensure title is guaranteed even if AI response omits it
    let title = interviewReportByAi?.title;
    if (!title || typeof title !== "string" || !title.trim()) {
      const cleanFirstLine = (jobDescription || "")
        .split("\n")[0]
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .trim();
      title =
        cleanFirstLine.length >= 3 && cleanFirstLine.length <= 60
          ? cleanFirstLine
          : "Custom Target Role Strategy";
    }

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeText,
      selfDescription,
      jobDescription,
      ...interviewReportByAi,
      title: title.trim(),
    });

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport,
    });
  } catch (error) {
    console.error("Error in generateInterviewReportController:", error);
    const rawMsg = error?.message || "";
    const isGeminiDemand =
      rawMsg.toLowerCase().includes("gemini") ||
      rawMsg.toLowerCase().includes("demand") ||
      rawMsg.toLowerCase().includes("overloaded") ||
      rawMsg.toLowerCase().includes("503") ||
      rawMsg.toLowerCase().includes("429") ||
      rawMsg.toLowerCase().includes("rate limit") ||
      rawMsg.toLowerCase().includes("quota") ||
      rawMsg.toLowerCase().includes("resource_exhausted") ||
      rawMsg.toLowerCase().includes("temporarily unavailable") ||
      rawMsg.toLowerCase().includes("failed to generate");

    const message = isGeminiDemand || !error.message
      ? "We couldn't generate your interview. Please try again."
      : error.message;

    res.status(500).json({
      message,
    });
  }
}

/**
 * @description Controller to get interview report by interviewId
 */
async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;
    const interviewReport = await interviewReportModel
      .findOne({
        _id: interviewId,
        user: req.user.id,
      })
      .select("-__v")
      .lean();

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    res.status(200).json({
      message: "Interview report fetched successfully",
      interviewReport,
    });
  } catch (error) {
    console.error("Error in getInterviewReportByIdController:", error);
    res.status(500).json({
      message: "Failed to fetch interview report",
    });
  }
}

/**
 * @description Controller to get all interview reports of logged in user with pagination support
 */
async function getAllInterviewReportsController(req, res) {
  try {
    const { page, limit } = req.query;

    const query = { user: req.user.id };

    // Validate and sanitize pagination parameters
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    const [total, reports] = await Promise.all([
      interviewReportModel.countDocuments(query),
      interviewReportModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .select(
          "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
        )
        .lean(),
    ]);

    const totalPages = Math.ceil(total / parsedLimit) || 1;

    res.status(200).json({
      message: "Interview reports fetched successfully",
      interviewReports: reports,
      reports,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error in getAllInterviewReportsController:", error);
    res.status(500).json({
      message: "Failed to fetch interview reports",
    });
  }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description
*/
async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel
      .findOne({
        _id: interviewReportId,
        user: req.user.id,
      })
      .select("resume jobDescription selfDescription title")
      .lean();

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    const { resume, jobDescription, selfDescription, title } = interviewReport;

    const pdfBuffer = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription,
      title,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error in generateResumePdfController:", error);
    res.status(500).json({
      message: "Failed to generate resume PDF",
    });
  }
}

/**
 * @description Controller to delete an interview report by interviewId
 */
async function deleteInterviewReportController(req, res) {
  try {
    const { interviewId } = req.params;

    const deleted = await interviewReportModel.findOneAndDelete({
      _id: interviewId,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Interview report not found or unauthorized",
      });
    }

    res.status(200).json({
      message: "Interview report deleted successfully",
      interviewId,
    });
  } catch (error) {
    console.error("Error in deleteInterviewReportController:", error);
    res.status(500).json({
      message: error.message || "Failed to delete interview report",
    });
  }
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
  deleteInterviewReportController,
};

