import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "الاسم مطلوب (حرفان على الأقل)").max(100),
    email: z.string().email("صيغة البريد الإلكتروني غير صحيحة"),
    password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل").max(128),
});

export const loginSchema = z.object({
    email: z.string().email("صيغة البريد الإلكتروني غير صحيحة"),
    password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("صيغة البريد الإلكتروني غير صحيحة"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل").max(128),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6, "كلمة المرور الجديدة 6 أحرف على الأقل").max(128),
});

export const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    avatar: z.string().url().optional().or(z.literal("")),
    notifications: z.boolean().optional(),
    darkMode: z.boolean().optional(),
});
