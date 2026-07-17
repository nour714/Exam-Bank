const { z } = require('zod');

const startAttemptSchema = z.object({
  examId: z.string().uuid(),
  metadata: z.record(z.any()).optional().default({}),
});

const saveAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answerData: z.any(), // JSON can be string, array, object depending on question type
});

const submitAttemptSchema = z.object({
  remainingSecs: z.number().int().min(0).optional(),
});

const reviewAnswerSchema = z.object({
  manualScore: z.number().int().min(0),
  feedback: z.string().optional(),
});

module.exports = {
  startAttemptSchema,
  saveAnswerSchema,
  submitAttemptSchema,
  reviewAnswerSchema,
};
