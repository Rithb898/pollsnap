import { z } from "zod";

export const submitResponseSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid("Invalid question ID"),
        optionId: z.string().uuid("Invalid option ID")
      })
    )
    .min(1, "At least one answer is required")
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
