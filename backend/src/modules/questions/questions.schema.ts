import { z } from "zod";

export const createQuestionSchema = z.object({
  text: z.string().min(1, "Question text is required").max(500),
  isMandatory: z.boolean().optional().default(true)
});

export const updateQuestionSchema = z.object({
  text: z.string().min(1, "Question text cannot be empty").max(500).optional(),
  isMandatory: z.boolean().optional()
});

export const reorderQuestionsSchema = z.object({
  questionIds: z.array(z.string().uuid("Invalid question ID"))
});

export const createOptionSchema = z.object({
  text: z.string().min(1, "Option text is required").max(255)
});

export const updateOptionSchema = z.object({
  text: z.string().min(1, "Option text cannot be empty").max(255)
});

export const reorderOptionsSchema = z.object({
  optionIds: z.array(z.string().uuid("Invalid option ID"))
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>;
export type CreateOptionInput = z.infer<typeof createOptionSchema>;
export type UpdateOptionInput = z.infer<typeof updateOptionSchema>;
export type ReorderOptionsInput = z.infer<typeof reorderOptionsSchema>;
