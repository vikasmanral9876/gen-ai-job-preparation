const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY,
});

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Executes a Gemini API generateContent call with automatic model fallback
 * to stable aliases (e.g. gemini-flash-latest) if the configured model is retired or overloaded.
 */
async function generateGeminiContent(params) {
  const modelCandidates = [
    params.model || GEMINI_MODEL,
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
  ];
  const uniqueModels = [...new Set(modelCandidates)];

  let lastError;
  for (let i = 0; i < uniqueModels.length; i++) {
    const currentModel = uniqueModels[i];
    for (let retry = 0; retry < 2; retry++) {
      try {
        return await ai.models.generateContent({
          ...params,
          model: currentModel,
        });
      } catch (err) {
        lastError = err;
        const is404 =
          err?.status === 404 ||
          err?.message?.includes("no longer available") ||
          err?.message?.includes("not found") ||
          err?.message?.includes("not supported");
        const is503Or429 =
          err?.status === 503 ||
          err?.status === 429 ||
          err?.message?.includes("high demand") ||
          err?.message?.includes("overloaded");

        if (is404) {
          console.warn(`Gemini model "${currentModel}" unavailable (404/retired). Trying next model...`);
          break; // Don't retry a 404 model, proceed directly to fallback
        }

        if (is503Or429) {
          console.warn(`Gemini model "${currentModel}" transient issue (${err?.status || "503"}). Retrying in 1.5s...`);
          await new Promise((r) => setTimeout(r, 1500 * (retry + 1)));
          continue;
        }

        throw err;
      }
    }
  }

  throw lastError;
}

const interviewReportJsonSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "The job title / role for which the interview report is generated (e.g. Senior Software Engineer)",
    },
    matchScore: {
      type: "number",
      description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description",
    },
    technicalQuestions: {
      type: "array",
      description: "Technical questions that can be asked in the interview along with their intention and model answers",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The technical question can be asked in the interview",
          },
          intention: {
            type: "string",
            description: "The intention of interviewer behind asking this question",
          },
          answer: {
            type: "string",
            description: "How to answer this question, what points to cover, what approach to take etc.",
          },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestions: {
      type: "array",
      description: "Behavioral questions that can be asked in the interview along with their intention and model answers",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The behavioral question can be asked in the interview",
          },
          intention: {
            type: "string",
            description: "The intention of interviewer behind asking this question",
          },
          answer: {
            type: "string",
            description: "How to answer this question, what points to cover, what approach to take etc.",
          },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGaps: {
      type: "array",
      description: "List of skill gaps in the candidate's profile along with their severity",
      items: {
        type: "object",
        properties: {
          skill: {
            type: "string",
            description: "The skill which the candidate is lacking",
          },
          severity: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "The severity of this skill gap",
          },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: "array",
      description: "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
      items: {
        type: "object",
        properties: {
          day: {
            type: "number",
            description: "The day number in the preparation plan, starting from 1",
          },
          focus: {
            type: "string",
            description: "The main focus of this day in the preparation plan",
          },
          tasks: {
            type: "array",
            items: { type: "string" },
            description: "List of tasks to be done on this day",
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },
  required: [
    "title",
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};

/**
 * Executes a promise with an enforced timeout to prevent indefinitely hanging requests.
 */
function withTimeout(promise, timeoutMs = 60000, operationName = "AI Request") {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(
        `${operationName} timed out after ${timeoutMs / 1000} seconds.`,
      );
      error.code = "ETIMEDOUT";
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Safely parses JSON responses from Gemini, stripping markdown code fences if present.
 */
function safeJsonParse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response received from AI model");
  }

  let text = rawText.trim();

  // Strip markdown code fences if returned (e.g. ```json ... ``` or ``` ...)
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();
  }

  try {
    return JSON.parse(text);
  } catch (initialErr) {
    // Fallback: extract substring between outermost JSON braces { ... }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    throw initialErr;
  }
}

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

  Ensure the output strictly includes a concise, realistic "title" for the target job role (e.g. "Senior Full-Stack Engineer" or extracted from the Job Description).
    `;
  try {
    const aiCall = generateGeminiContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: interviewReportJsonSchema,
      },
    });

    const response = await withTimeout(
      aiCall,
      60000,
      "Interview Plan Generation",
    );

    return safeJsonParse(response.text);
  } catch (err) {
    console.error("Gemini API Error in generateInterviewReport:", err);
    throw new Error(
      "We couldn't generate your interview. Please try again.",
    );
  }
}

async function generatePdfFromHtml(htmlContent) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Puppeteer PDF generation failed:", error);
    throw new Error("Failed to generate PDF document");
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error("Error closing Puppeteer browser instance:", closeErr);
      }
    }
  }
}

async function generateResumePdf({ resume, selfDescription, jobDescription, title }) {
  const resumePdfJsonSchema = {
    type: "object",
    properties: {
      html: {
        type: "string",
        description:
          "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      },
    },
    required: ["html"],
  };

  const prompt = `Generate resume for a candidate with the following details: 
                    ${title ? `Target Job Title: ${title}\n` : ""}
                    Resume: ${resume || "Not provided"}
                    Self Description: ${selfDescription || "Not provided"}
                    Job Description: ${jobDescription || "Not provided"}

                    the response should be JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer
                    The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                    The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                    you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                    The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                    The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                  `;
  try {
    const aiCall = generateGeminiContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: resumePdfJsonSchema,
      },
    });

    const response = await withTimeout(
      aiCall,
      60000,
      "Resume Tailoring",
    );

    const jsonContent = safeJsonParse(response.text);

    if (!jsonContent || !jsonContent.html) {
      throw new Error("Invalid resume format returned by AI");
    }

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

    return pdfBuffer;
  } catch (err) {
    console.error("Error in generateResumePdf:", err);
    throw new Error("Failed to generate resume PDF. Please try again.");
  }
}

module.exports = { generateInterviewReport, generateResumePdf };
