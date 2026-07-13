import prisma from "../config/database.js";
import { successResponse } from "../utils/response.js";

export async function getExamAttempts(req, res, next) {
    try {
        const attempts = await prisma.examAttempt.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
        });
        return successResponse(res, attempts);
    } catch (error) {
        next(error);
    }
}

export async function submitExamAttempt(req, res, next) {
    try {
        const { score, total, duration, grade, pathway } = req.body;
        
        const attempt = await prisma.examAttempt.create({
            data: {
                userId: req.user.id,
                score: score || 0,
                total: total || 0,
                duration: duration || 0,
                grade: grade || null,
                pathway: pathway || null,
            },
        });
        
        return successResponse(res, attempt, "تم حفظ نتيجة الاختبار", 201);
    } catch (error) {
        next(error);
    }
}
