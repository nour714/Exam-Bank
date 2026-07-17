const { z } = require('zod');

/**
 * Allowed setting categories. Extend this as new platform areas are added.
 */
const SETTING_CATEGORIES = [
  'ai',
  'storage',
  'security',
  'email',
  'exams',
  'notifications',
  'themes',
  'general',
  'billing',
  'ocr',
];

const settingSchema = z.object({
  category: z.enum(SETTING_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${SETTING_CATEGORIES.join(', ')}` }),
  }),
  key: z.string()
    .min(1, 'Key is required')
    .max(100, 'Key must be 100 characters or fewer')
    .regex(/^[a-z0-9_.-]+$/, 'Key must be lowercase alphanumeric with dots, dashes, or underscores'),
  value: z.unknown(),
  tenantId: z.string().uuid().optional().nullable(),
});

const settingCategoryParam = z.object({
  category: z.enum(SETTING_CATEGORIES),
});

const settingIdParam = z.object({
  id: z.string().uuid(),
});

module.exports = {
  settingSchema,
  settingCategoryParam,
  settingIdParam,
  SETTING_CATEGORIES,
};
