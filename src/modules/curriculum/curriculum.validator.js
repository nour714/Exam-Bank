const { z } = require('zod');

const createCurriculumSchema = z.object({
  name: z.string().min(2).max(100),
  country: z.string().max(100).optional(),
  system: z.string().max(100).optional(),
  description: z.string().optional(),
});

const createGradeSchema = z.object({
  curriculumId: z.string().uuid(),
  name: z.string().min(1).max(100),
  order: z.number().int().default(0),
});

const createSubjectSchema = z.object({
  curriculumId: z.string().uuid(),
  gradeId: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  code: z.string().max(20).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

const createUnitSchema = z.object({
  subjectId: z.string().uuid(),
  name: z.string().min(1).max(100),
  order: z.number().int().default(0),
  description: z.string().optional(),
});

const createLessonSchema = z.object({
  unitId: z.string().uuid(),
  name: z.string().min(1).max(100),
  order: z.number().int().default(0),
  content: z.record(z.any()).optional(),
});

const paginationQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  curriculumId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
});

module.exports = {
  createCurriculumSchema,
  createGradeSchema,
  createSubjectSchema,
  createUnitSchema,
  createLessonSchema,
  paginationQuery,
};
