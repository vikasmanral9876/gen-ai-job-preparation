require("dotenv").config();

// Validate critical environment variables at startup without leaking values
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const hasAiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY);

if (!hasAiKey) {
  missingEnv.push("GEMINI_API_KEY");
}

if (missingEnv.length > 0) {
  console.warn(
    `[CONFIG WARNING] Missing required environment variables:\n` +
      missingEnv.map((k) => ` - ${k}`).join("\n") +
      `\nPlease verify your environment configuration.`,
  );
  if (process.env.NODE_ENV === "production") {
    console.error("[FATAL] Production startup aborted due to missing configuration.");
    process.exit(1);
  }
}

const app = require("./src/app");
const connectToDB = require("./src/config/database");

connectToDB()

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});