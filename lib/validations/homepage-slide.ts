import { z } from "zod";

const homepageSlideBaseSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
    description: z
      .string()
      .trim()
      .max(300, "Description cannot exceed 300 characters")
      .optional()
      .transform((value) => value || null),
    ctaLabel: z
      .string()
      .trim()
      .max(40, "CTA label cannot exceed 40 characters")
      .optional()
      .transform((value) => value || null),
    ctaHref: z
      .string()
      .trim()
      .max(255, "CTA link cannot exceed 255 characters")
      .optional()
      .transform((value) => value || null),
    sortOrder: z.coerce.number().int().default(0),
    isActive: z.coerce.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    const hasLabel = Boolean(value.ctaLabel);
    const hasHref = Boolean(value.ctaHref);

    if (hasLabel !== hasHref) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CTA label and CTA link must either both be filled or both be empty",
      });
    }
  });

export const homepageSlideCreateSchema = homepageSlideBaseSchema;

export const homepageSlideUpdateSchema = homepageSlideBaseSchema.extend({
  id: z.string().uuid("Invalid slide ID"),
  existingImageUrl: z
    .string()
    .trim()
    .url("Existing image URL is invalid")
    .optional()
    .transform((value) => value || null),
});

export type HomepageSlideCreateInput = z.infer<typeof homepageSlideCreateSchema>;
export type HomepageSlideUpdateInput = z.infer<typeof homepageSlideUpdateSchema>;
