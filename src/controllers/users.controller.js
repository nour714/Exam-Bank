import prisma from "../config/database.js";
import { successResponse } from "../utils/response.js";

/**
 * PUT /api/users/stats
 * Sync user progress data (xp, streak, accuracy, etc.)
 */
export async function syncUserStats(req, res, next) {
    try {
        const { xp, solvedCount, streak, accuracy, lastActiveDate, weeklyActivity } = req.body;

        const updateData = {};
        if (xp !== undefined) updateData.xp = xp;
        if (solvedCount !== undefined) updateData.solvedCount = solvedCount;
        if (streak !== undefined) updateData.streak = streak;
        if (accuracy !== undefined) updateData.accuracy = accuracy;
        if (lastActiveDate) updateData.lastActiveDate = new Date(lastActiveDate);

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: { id: true, xp: true, solvedCount: true, streak: true, accuracy: true },
        });

        // Sync weekly activity if provided
        if (Array.isArray(weeklyActivity)) {
            for (const day of weeklyActivity) {
                await prisma.weeklyActivity.upsert({
                    where: { userId_dayIndex: { userId: req.user.id, dayIndex: day.dayIndex } },
                    update: { count: day.count },
                    create: { userId: req.user.id, dayIndex: day.dayIndex, count: day.count },
                });
            }
        }

        return successResponse(res, user, "تم مزامنة البيانات");
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/users/stats
 */
export async function getUserStats(req, res, next) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { xp: true, solvedCount: true, streak: true, accuracy: true, lastActiveDate: true },
        });

        const weeklyActivity = await prisma.weeklyActivity.findMany({
            where: { userId: req.user.id },
            orderBy: { dayIndex: "asc" },
        });

        return successResponse(res, { ...user, weeklyActivity });
    } catch (error) {
        next(error);
    }
}
