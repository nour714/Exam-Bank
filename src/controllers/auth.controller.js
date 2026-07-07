import prisma from "../config/database.js";
import config from "../config/index.js";
import {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    setAuthCookies,
    clearAuthCookies,
} from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from "../utils/errors.js";

/**
 * POST /api/auth/register
 */
export async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new ConflictError("البريد الإلكتروني مسجل بالفعل");
        }

        const hashedPassword = await hashPassword(password);

        // Determine role
        const role = config.adminEmails.includes(email) ? "ADMIN" : "USER";

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role },
        });

        const tokenPayload = { id: user.id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        setAuthCookies(res, accessToken, refreshToken);

        return successResponse(res, {
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            accessToken,
        }, "تم إنشاء الحساب بنجاح", 201);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UnauthorizedError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        }

        const passwordMatch = await comparePassword(password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        }

        // Update last active
        await prisma.user.update({ where: { id: user.id }, data: { lastActiveDate: new Date() } });

        const tokenPayload = { id: user.id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        setAuthCookies(res, accessToken, refreshToken);

        return successResponse(res, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                xp: user.xp,
                solvedCount: user.solvedCount,
                streak: user.streak,
                accuracy: user.accuracy,
            },
            accessToken,
        }, "تم تسجيل الدخول بنجاح");
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/refresh
 */
export async function refresh(req, res, next) {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            throw new UnauthorizedError("Refresh token is required");
        }

        const decoded = verifyRefreshToken(token);
        const tokenPayload = { id: decoded.id, email: decoded.email, role: decoded.role };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        setAuthCookies(res, accessToken, refreshToken);

        return successResponse(res, { accessToken }, "Token refreshed");
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res) {
    clearAuthCookies(res);
    return successResponse(res, null, "تم تسجيل الخروج بنجاح");
}

/**
 * GET /api/auth/me
 */
export async function getMe(req, res, next) {
    try {

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, name: true, email: true, role: true,
                avatar: true, xp: true, solvedCount: true, streak: true,
                accuracy: true, notifications: true, darkMode: true,
                lastActiveDate: true, createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundError("المستخدم غير موجود");
        }

        return successResponse(res, user);
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/auth/profile
 */
export async function updateProfile(req, res, next) {
    try {
        const { name, avatar, notifications, darkMode } = req.body;
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (notifications !== undefined) updateData.notifications = notifications;
        if (darkMode !== undefined) updateData.darkMode = darkMode;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: {
                id: true, name: true, email: true, avatar: true,
                notifications: true, darkMode: true,
            },
        });

        return successResponse(res, user, "تم تحديث الملف الشخصي");
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/auth/change-password
 */
export async function changePassword(req, res, next) {
    try {

        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        const valid = await comparePassword(currentPassword, user.password);
        if (!valid) {
            throw new UnauthorizedError("كلمة المرور الحالية غير صحيحة");
        }

        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } });

        return successResponse(res, null, "تم تغيير كلمة المرور بنجاح");
    } catch (error) {
        next(error);
    }
}
