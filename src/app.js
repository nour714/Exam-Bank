import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import questionsRoutes from "./routes/questions.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import examsRoutes from "./routes/exams.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and utility middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Disabling for now so frontend can load external scripts/images easily
}));
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));

// Serve static frontend files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/exams", examsRoutes);

// SPA Fallback for frontend routing (if needed)
app.use((req, res, next) => {
    if (req.method !== "GET" || req.originalUrl.startsWith("/api")) {
        return next();
    }
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
