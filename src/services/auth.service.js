import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config/index.js";

const SALT_ROUNDS = 12;

export async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload) {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function generateRefreshToken(payload) {
    return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiresIn });
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, config.jwtRefreshSecret);
}

/**
 * Set auth cookies on response.
 */
export function setAuthCookies(res, accessToken, refreshToken) {
    const isProduction = config.nodeEnv === "production";

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/api/auth/refresh",
    });
}

export function clearAuthCookies(res) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
}
