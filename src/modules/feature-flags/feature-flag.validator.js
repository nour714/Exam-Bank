const { z } = require('zod');

const featureFlagSchema = z.object({
  key: z.string()
    .min(1, 'Key is required')
    .max(100, 'Key must be 100 characters or fewer')
    .regex(/^[a-z0-9_.-]+$/, 'Key must be lowercase alphanumeric with dots, dashes, or underscores'),
  enabled: z.boolean().optional().default(false),
  description: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
  tenantId: z.string().uuid().optional().nullable(),
});

const featureFlagKeyParam = z.object({
  key: z.string().min(1),
});

const featureFlagIdParam = z.object({
  id: z.string().uuid(),
});

module.exports = {
  featureFlagSchema,
  featureFlagKeyParam,
  featureFlagIdParam,
};
