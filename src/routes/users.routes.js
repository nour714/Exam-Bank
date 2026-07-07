import { Router } from "express";
import { syncUserStats, getUserStats } from "../controllers/users.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// Apply auth middleware to all user routes
router.use(verifyToken);

router.get("/stats", getUserStats);
router.put("/stats", syncUserStats);

export default router;
