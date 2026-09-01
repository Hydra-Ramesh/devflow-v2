import { z } from 'zod';

export const createAnswerSchema = z.object({
  content: z
    .string()
    .min(10, 'Answer must be at least 10 characters long')
    .trim(),
  questionId: z.string().uuid('Invalid Question ID'),
});

export const updateAnswerSchema = z.object({
  content: z
    .string()
    .min(10, 'Answer must be at least 10 characters long')
    .trim()
    .optional(),
  isAccepted: z.boolean().optional(),
});
