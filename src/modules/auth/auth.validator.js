const { z } = require('zod');

const registerSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or fewer')
    .transform((v) => v.toLowerCase().trim()),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be 128 characters or fewer'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name must be 100 characters or fewer')
    .trim(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be 100 characters or fewer')
    .trim(),
  locale: z.enum(['ar', 'en']).optional().default('ar'),
});

const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .transform((v) => v.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'New password must be 128 characters or fewer')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number'),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
};
