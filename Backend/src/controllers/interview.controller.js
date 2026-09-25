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

    const resumeContent = await new pdfParse.PDFParse(
      Uint8Array.from(req.file.buffer),
    ).getText();
    const { selfDescription = "", jobDescription = "" } = req.body;

    const interviewReportByAi = await generateInterviewReport({
      resume: resumeContent.text,
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
      resume: resumeContent.text,
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
    res.status(500).json({
      message: error.message || "Failed to generate interview report",
    });
  }
}

/**
 * @description Controller to get interview report by interviewId
 */
async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;
    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

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
    res.status(500).json({
      message: error.message || "Failed to fetch interview report",
    });
  }
}

/**
 * @description Controller to get all interview reports of logged in user
 */
async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
      );

    res.status(200).json({
      message: "Interview reports fetched successfully",
      interviewReports,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch interview reports",
    });
  }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description
*/
async function generateResumePdfController(req, res) {
  const { interviewReportId } = req.params

  const interviewReport = await interviewReportModel.findById(interviewReportId) 

  if(!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found"
    })
  }

  const { resume, jobDescription, selfDescription } = interviewReport

  const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
  })
  
  res.send(pdfBuffer)
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

