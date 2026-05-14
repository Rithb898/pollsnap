import { z } from "zod";

export const createPollSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  isAnonymous: z.boolean().optional(),
  expiresAt: z
    .string()
    .datetime({ message: "expiresAt must be a valid ISO 8601 datetime" })
    .optional(),
  responseGoal: z
    .number()
    .int("Response goal must be an integer")
    .positive("Response goal must be positive")
    .optional()
});

export const updatePollSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title must be 255 characters or less")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  isAnonymous: z.boolean().optional(),
  expiresAt: z
    .string()
    .datetime({ message: "expiresAt must be a valid ISO 8601 datetime" })
    .optional()
    .nullable(),
  responseGoal: z
    .number()
    .int("Response goal must be an integer")
    .positive("Response goal must be positive")
    .optional()
    .nullable()
});

export const listPollsQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be an integer")
    .positive("Page must be positive")
    .default(1),
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .positive("Limit must be positive")
    .max(100, "Limit must be 100 or less")
    .default(10),
  status: z.enum(["draft", "active", "closed"]).optional()
});

export type CreatePollInput = z.infer<typeof createPollSchema>;
export type UpdatePollInput = z.infer<typeof updatePollSchema>;
export type ListPollsQuery = z.infer<typeof listPollsQuerySchema>;
