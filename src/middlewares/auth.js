import jwt from "jsonwebtoken";
import config from "../config/index.js";
import prisma from "../config/database.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";

/**
 * Middleware to verify JWT access token from cookies or Authorization header.
 */
export function verifyToken(req, res, next) {
    try {
        let token = null;

        // 1. Try HTTP-Only cookie
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        // 2. Fallback to Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            throw new UnauthorizedError("Access token is required");
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded; // { id, email, role }
        next();
    } catch (error) {
        if (error instanceof UnauthorizedError) return next(error);
        if (error.name === "TokenExpiredError") return next(new UnauthorizedError("Token expired"));
        return next(new UnauthorizedError("Invalid token"));
    }
}

/**
 * Middleware to optionally attach user if token exists (doesn't block).
 */
export function optionalAuth(req, res, next) {
    try {
        let token = null;
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (token) {
            const decoded = jwt.verify(token, config.jwtSecret);
            req.user = decoded;
        }
    } catch {
        // Silently ignore — user is just not authenticated
    }
    next();
}

/**
 * Middleware to require a specific role.
 */
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError("Authentication required"));
        }
        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError("You do not have permission to perform this action"));
        }
        next();
    };
}

/**
 * Middleware to require ADMIN role.
 */
export const requireAdmin = requireRole("ADMIN");
