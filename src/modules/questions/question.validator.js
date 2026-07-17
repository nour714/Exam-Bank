const { z } = require('zod');

const QuestionType = z.enum([
  'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY', 
  'MATCHING', 'ORDERING', 'FILL_IN_BLANK', 'IMAGE_BASED', 'MULTI_SELECT'
]);

const DifficultyLevel = z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']);

const createChoiceSchema = z.object({
  content: z.record(z.any()), // Supports plain text or rich formatting { text: "...", format: "html" }
  isCorrect: z.boolean().default(false),
  order: z.number().int().default(0),
});

const createQuestionSchema = z.object({
  subjectId: z.string().uuid(),
  lessonId: z.string().uuid().optional(),
  type: QuestionType,
  difficulty: DifficultyLevel.default('MEDIUM'),
  content: z.record(z.any()),
  explanation: z.record(z.any()).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(), // For matching pairs, drag/drop coordinates etc.
  tags: z.array(z.string()).default([]),
  points: z.number().int().min(1).default(1),
  isPublished: z.boolean().default(false),
  choices: z.array(createChoiceSchema).optional().default([]),
});

const paginationQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  subjectId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  type: QuestionType.optional(),
  difficulty: DifficultyLevel.optional(),
  tags: z.string().optional().transform(v => v ? v.split(',') : undefined),
});

module.exports = {
  createQuestionSchema,
  paginationQuery,
};
