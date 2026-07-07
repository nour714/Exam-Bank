import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET environment variable is not defined.");
}

const config = {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",

    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

    // Database
    databaseUrl: process.env.DATABASE_URL,

    // AI
    aiApiKey: process.env.AI_API_KEY,
    aiBaseUrl: (process.env.AI_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/$/, ""),
    aiModel: process.env.AI_MODEL || "llama-3.3-70b-versatile",
    aiVisionModel: process.env.AI_VISION_MODEL || "gemini-1.5-flash",
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || "*",

    // Email (Nodemailer)
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
    smtpUser: process.env.SMTP_USER || "",
    smtpPass: process.env.SMTP_PASS || "",
    mailFrom: process.env.MAIL_FROM || "Exam Bank <noreply@exambank.com>",

    // Admin
    adminEmails: (process.env.ADMIN_EMAILS || "noureg122@gmail.com").split(",").map(e => e.trim()),
};

export default config;
