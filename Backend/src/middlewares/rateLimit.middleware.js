const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for authentication routes (login, register).
 * Protects against brute-force credential stuffing and registration spam.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many authentication attempts. Please try again after 15 minutes.",
  },
});

/**
 * Rate limiter for AI interview generation.
 * Protects Gemini API quota, server memory, and concurrent load.
 */
const aiGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 generation requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Interview generation limit reached. Please wait a few minutes before creating another plan.",
  },
});

/**
 * Rate limiter for Puppeteer PDF resume generation.
 * Protects headless browser instances and memory from exhaustion.
 */
const pdfGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 PDF downloads per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many PDF download requests. Please wait a few minutes before trying again.",
  },
});

module.exports = {
  authLimiter,
  aiGenerationLimiter,
  pdfGenerationLimiter,
};
