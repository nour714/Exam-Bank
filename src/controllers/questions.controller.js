import prisma from "../config/database.js";
import { successResponse, paginatedResponse } from "../utils/response.js";
import { NotFoundError } from "../utils/errors.js";

/**
 * GET /api/questions/global
 */
export async function getGlobalQuestions(req, res, next) {
    try {
        const { subject, page = 1, limit = 50, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where = {};
        if (subject) where.subject = subject;
        if (search) {
            where.OR = [
                { text: { contains: search, mode: "insensitive" } },
                { topic: { contains: search, mode: "insensitive" } },
            ];
        }

        const [questions, total] = await Promise.all([
            prisma.globalQuestion.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
            prisma.globalQuestion.count({ where }),
        ]);

        return paginatedResponse(res, questions, total, parseInt(page), take);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/questions/global (Admin only)
 */
export async function createGlobalQuestion(req, res, next) {
    try {
        const question = await prisma.globalQuestion.create({
            data: { ...req.body, addedById: req.user.id },
        });
        return successResponse(res, question, "تمت إضافة السؤال بنجاح", 201);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/questions/global/bulk (Admin only)
 */
export async function bulkCreateGlobalQuestions(req, res, next) {
    try {
        const { questions } = req.body;
        if (!Array.isArray(questions) || questions.length === 0) {
            return successResponse(res, { count: 0 }, "No questions provided");
        }

        const data = questions.map(q => ({
            subject: q.subject,
            topic: q.topic || null,
            text: q.text,
            options: q.options,
            correct: q.correct,
            imageUrl: q.imageUrl || null,
            addedById: req.user.id,
        }));

        const result = await prisma.globalQuestion.createMany({ data });
        return successResponse(res, { count: result.count }, `تمت إضافة ${result.count} سؤال بنجاح`, 201);
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/questions/global/:id (Admin only)
 */
export async function deleteGlobalQuestion(req, res, next) {
    try {
        await prisma.globalQuestion.delete({ where: { id: req.params.id } });
        return successResponse(res, null, "تم حذف السؤال بنجاح");
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/questions/global/:id (Admin only)
 */
export async function updateGlobalQuestion(req, res, next) {
    try {
        const { subject, topic, text, options, correct, imageUrl } = req.body;
        
        const updateData = {};
        if (subject !== undefined) updateData.subject = subject;
        if (topic !== undefined) updateData.topic = topic;
        if (text !== undefined) updateData.text = text;
        if (options !== undefined) updateData.options = options;
        if (correct !== undefined) updateData.correct = correct;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

        const question = await prisma.globalQuestion.update({
            where: { id: req.params.id },
            data: updateData,
        });
        return successResponse(res, question, "تم تحديث السؤال بنجاح");
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/questions/global (Admin only — clear all)
 */
export async function deleteAllGlobalQuestions(req, res, next) {
    try {
        const result = await prisma.globalQuestion.deleteMany({});
        return successResponse(res, { count: result.count }, `تم حذف ${result.count} سؤال`);
    } catch (error) {
        next(error);
    }
}

// ── Custom Questions (per user) ──────────────────────────

/**
 * GET /api/questions/custom
 */
export async function getCustomQuestions(req, res, next) {
    try {
        const questions = await prisma.customQuestion.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
        });
        return successResponse(res, questions);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/questions/custom
 */
export async function createCustomQuestion(req, res, next) {
    try {
        const question = await prisma.customQuestion.create({
            data: { ...req.body, userId: req.user.id },
        });
        return successResponse(res, question, "تمت إضافة السؤال", 201);
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/questions/custom/:id
 */
export async function deleteCustomQuestion(req, res, next) {
    try {
        const result = await prisma.customQuestion.deleteMany({
            where: { id: req.params.id, userId: req.user.id },
        });
        
        if (result.count === 0) {
            return res.status(404).json({ success: false, message: "السؤال غير موجود أو لا تملك صلاحية حذفه" });
        }
        
        return successResponse(res, null, "تم حذف السؤال");
    } catch (error) {
        next(error);
    }
}
