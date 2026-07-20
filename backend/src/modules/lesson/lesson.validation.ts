import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional(),
});

export const updateLessonSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(200).optional(),
  description: z.string().trim().max(5000).nullish(),
});

export const lessonIdParamSchema = z.object({
  id: z.string().uuid("Invalid lesson id"),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
