import { Router } from "express";
import { register, login, refresh, logout, getMe, updateProfile, changePassword } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { verifyToken } from "../middlewares/auth.js";
import {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    changePasswordSchema
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", verifyToken, getMe);
router.put("/profile", verifyToken, validate(updateProfileSchema), updateProfile);
router.put("/change-password", verifyToken, validate(changePasswordSchema), changePassword);

export default router;
