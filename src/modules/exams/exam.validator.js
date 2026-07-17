const { z } = require('zod');

const ExamType = z.enum(['PRACTICE', 'MOCK', 'TIMED', 'ADAPTIVE', 'AI_GENERATED', 'CUSTOM']);

const examQuestionSchema = z.object({
  questionId: z.string().uuid(),
  order: z.number().int().optional(),
  points: z.number().int().optional(),
});

const createExamSchema = z.object({
  subjectId: z.string().uuid(),
  curriculumId: z.string().uuid().optional(),
  title: z.string().min(2).max(255),
  description: z.string().optional(),
  type: ExamType,
  durationMins: z.number().int().positive().optional().nullable(),
  passingScore: z.number().int().positive().default(50),
  config: z.record(z.any()).optional().nullable(), // Store adaptive logic thresholds etc.
  questions: z.array(examQuestionSchema).optional().default([]),
});

const paginationQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  subjectId: z.string().uuid().optional(),
  type: ExamType.optional(),
});

module.exports = {
  createExamSchema,
  paginationQuery,
};
