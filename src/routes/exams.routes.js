import { Router } from "express";
import { verifyToken } from "../middlewares/auth.js";
import { getExamAttempts, submitExamAttempt } from "../controllers/exams.controller.js";

const router = Router();

router.use(verifyToken);

router.get("/attempts", getExamAttempts);
router.post("/attempts", submitExamAttempt);

export default router;
