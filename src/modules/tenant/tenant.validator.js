const { z } = require('zod');

const createTenantSchema = z.object({
  name: z.string().min(2, 'Tenant name must be at least 2 characters').max(100),
  domain: z.string().regex(/^[a-zA-Z0-9.-]+$/, 'Invalid domain format').optional().nullable(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional().default('free'),
});

const updateTenantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  domain: z.string().regex(/^[a-zA-Z0-9.-]+$/).optional().nullable(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional(),
  metadata: z.record(z.any()).optional(),
});

const tenantIdParam = z.object({
  id: z.string().uuid(),
});

const paginationQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
});

module.exports = {
  createTenantSchema,
  updateTenantSchema,
  tenantIdParam,
  paginationQuery,
};
