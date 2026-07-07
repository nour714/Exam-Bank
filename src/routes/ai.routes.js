import { Router } from "express";
import { aiMentor, extractQuestionImage, generateSimilarQuestions } from "../controllers/ai.controller.js";
import { verifyToken, optionalAuth } from "../middlewares/auth.js";

const router = Router();

// We use optionalAuth if we want to allow guests, or verifyToken if we want to restrict AI to logged-in users.
// Based on app.js, AI mentor is usually available to users, so let's protect it, or use optionalAuth if needed.
// We'll use verifyToken to ensure only registered users can use AI APIs to prevent abuse.

router.post("/mentor", verifyToken, aiMentor);
router.post("/extract-question-image", verifyToken, extractQuestionImage);
router.post("/generate-similar", verifyToken, generateSimilarQuestions);

export default router;
