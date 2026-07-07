import { Router } from "express";
import {
    getGlobalQuestions,
    createGlobalQuestion,
    bulkCreateGlobalQuestions,
    updateGlobalQuestion,
    deleteGlobalQuestion,
    deleteAllGlobalQuestions,
    getCustomQuestions,
    createCustomQuestion,
    deleteCustomQuestion
} from "../controllers/questions.controller.js";
import { verifyToken, requireAdmin } from "../middlewares/auth.js";

const router = Router();

// Global Questions
router.get("/global", getGlobalQuestions);
router.post("/global", verifyToken, requireAdmin, createGlobalQuestion);
router.post("/global/bulk", verifyToken, requireAdmin, bulkCreateGlobalQuestions);
router.put("/global/:id", verifyToken, requireAdmin, updateGlobalQuestion);
router.delete("/global/:id", verifyToken, requireAdmin, deleteGlobalQuestion);
router.delete("/global", verifyToken, requireAdmin, deleteAllGlobalQuestions);

// Custom Questions
router.get("/custom", verifyToken, getCustomQuestions);
router.post("/custom", verifyToken, createCustomQuestion);
router.delete("/custom/:id", verifyToken, deleteCustomQuestion);

export default router;
