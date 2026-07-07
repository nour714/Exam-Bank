import { errorResponse } from "../utils/response.js";

/**
 * Global error handling middleware.
 * Must be registered LAST in the Express middleware chain.
 */
export function errorHandler(err, req, res, _next) {
    // Log the error in development
    if (process.env.NODE_ENV !== "production") {
        console.error("❌ Error:", err);
    }

    // Prisma known errors
    if (err.code === "P2002") {
        return errorResponse(res, "A record with that value already exists.", 409);
    }
    if (err.code === "P2025") {
        return errorResponse(res, "Record not found.", 404);
    }

    // Zod validation errors
    if (err.name === "ZodError") {
        const errors = err.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
        return errorResponse(res, "Validation failed", 400, errors);
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return errorResponse(res, "Invalid token", 401);
    }
    if (err.name === "TokenExpiredError") {
        return errorResponse(res, "Token expired", 401);
    }

    // Custom AppError
    if (err.isOperational) {
        return errorResponse(res, err.message, err.statusCode, err.errors);
    }

    // Unknown errors — never expose internals
    return errorResponse(res, "Internal server error", 500);
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req, res) {
    return errorResponse(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
}
