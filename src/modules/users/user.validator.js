const { z } = require('zod');
const { ROLES } = require('../../shared/constants');

const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  locale: z.enum(['ar', 'en']).optional(),
  avatar: z.string().url().optional().nullable(),
});

const assignRoleSchema = z.object({
  role: z.enum(Object.values(ROLES)),
});

const userIdParam = z.object({
  id: z.string().uuid(),
});

const paginationQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
});

module.exports = {
  updateUserSchema,
  assignRoleSchema,
  userIdParam,
  paginationQuery,
};
