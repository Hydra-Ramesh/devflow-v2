import { z } from "zod";

export const createQuestionSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters long")
    .max(250, "Title cannot exceed 250 characters")
    .trim(),
  content: z
    .string()
    .min(15, "Content description must be at least 15 characters long")
    .trim(),
  tags: z
    .array(z.string().min(1).max(35))
    .min(1, "Please provide at least 1 tag")
    .max(8, "Maximum 8 tags allowed")
    .transform((tags) => [
      ...new Set(tags.map((t) => t.toLowerCase().trim()).filter(Boolean)),
    ]),
});

export const updateQuestionSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters long")
    .max(250, "Title cannot exceed 250 characters")
    .trim()
    .optional(),
  content: z
    .string()
    .min(15, "Content description must be at least 15 characters long")
    .trim()
    .optional(),
  tags: z
    .array(z.string().min(1).max(35))
    .min(1, "Please provide at least 1 tag")
    .max(8, "Maximum 8 tags allowed")
    .transform((tags) => [
      ...new Set(tags.map((t) => t.toLowerCase().trim()).filter(Boolean)),
    ])
    .optional(),
});

export const queryQuestionSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().optional().default(""),
  tags: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        : [],
    ),
  filter: z
    .enum(["newest", "frequent", "unanswered", "votes"])
    .optional()
    .default("newest"),
});
