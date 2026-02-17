import { z } from "zod";

const keyPattern = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

const i18nStringBaseSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "Key must be at least 2 characters")
    .max(180, "Key is too long")
    .regex(keyPattern, "Key can use lowercase letters, numbers, dots, underscores, and hyphens"),
  geo: z.string().trim().min(1, "GEO translation is required"),
  en: z.string().trim().min(1, "ENG translation is required"),
  ru: z.string().trim().min(1, "RUS translation is required"),
  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .optional()
    .transform((value) => value || null),
});

export const i18nStringCreateSchema = i18nStringBaseSchema;

export const i18nStringUpdateSchema = i18nStringBaseSchema.extend({
  id: z.string().uuid("Invalid translation ID"),
});

export type I18nStringCreateInput = z.infer<typeof i18nStringCreateSchema>;
export type I18nStringUpdateInput = z.infer<typeof i18nStringUpdateSchema>;
