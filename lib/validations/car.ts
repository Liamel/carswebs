import { z } from "zod";

import { BODY_TYPE_OPTIONS, normalizeBodyTypeInput } from "@/lib/constants/body-types";

const carSpecItemSchema = z.object({
  label: z.string().trim().min(1, "Spec label is required").max(80, "Spec label is too long"),
  value: z.string().trim().min(1, "Spec value is required").max(200, "Spec value is too long"),
});

const carSpecListSchema = z
  .array(carSpecItemSchema)
  .min(1, "Add at least one specification")
  .max(60, "Too many specification rows")
  .superRefine((rows, ctx) => {
    const seen = new Set<string>();

    for (const [index, row] of rows.entries()) {
      const key = row.label.toLowerCase();

      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Specification labels must be unique",
          path: [index, "label"],
        });
        return;
      }

      seen.add(key);
    }
  });

const carImageListSchema = z
  .array(
    z
      .string()
      .trim()
      .url("Each image must be a valid URL"),
  )
  .min(1, "Upload at least one image")
  .max(20, "Maximum 20 images per car");

function normalizeSlugInput(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseSpecsPayload(value: string, ctx: z.RefinementCtx) {
  try {
    const parsed = JSON.parse(value);
    const validated = carSpecListSchema.safeParse(parsed);

    if (!validated.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validated.error.issues[0]?.message ?? "Invalid specification list",
      });
      return z.NEVER;
    }

    return Object.fromEntries(validated.data.map((item) => [item.label, item.value]));
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Specifications payload is invalid",
    });
    return z.NEVER;
  }
}

function parseImagesPayload(value: string, ctx: z.RefinementCtx) {
  try {
    const parsed = JSON.parse(value);
    const validated = carImageListSchema.safeParse(parsed);

    if (!validated.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validated.error.issues[0]?.message ?? "Invalid images list",
      });
      return z.NEVER;
    }

    return validated.data;
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Images payload is invalid",
    });
    return z.NEVER;
  }
}

export const carSchema = z.object({
  nameGeo: z.string().trim().min(2, "Georgian name must be at least 2 characters").max(120),
  nameEn: z.string().trim().min(2, "English name must be at least 2 characters").max(120),
  nameRu: z.string().trim().min(2, "Russian name must be at least 2 characters").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(140)
    .transform((value) => normalizeSlugInput(value))
    .refine((value) => value.length >= 2, "Slug must contain at least 2 letters or numbers")
    .refine((value) => /^[a-z0-9-]+$/.test(value), "Slug must contain lowercase letters, numbers, and hyphens only"),
  priceFrom: z.coerce.number().int().positive("Price must be greater than 0"),
  bodyType: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .transform((value, ctx) => {
      const normalized = normalizeBodyTypeInput(value);

      if (normalized) {
        return normalized;
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Body type must be one of: ${BODY_TYPE_OPTIONS.join(", ")}`,
      });
      return z.NEVER;
    }),
  descriptionGeo: z.string().trim().min(10, "Georgian description must be at least 10 characters").max(4000),
  descriptionEn: z.string().trim().min(10, "English description must be at least 10 characters").max(4000),
  descriptionRu: z.string().trim().min(10, "Russian description must be at least 10 characters").max(4000),
  featured: z.coerce.boolean().default(false),
  specsPayload: z.string().trim().transform((value, ctx) => parseSpecsPayload(value, ctx)),
  imagesPayload: z.string().trim().transform((value, ctx) => parseImagesPayload(value, ctx)),
});

export type CarInput = z.infer<typeof carSchema>;
export type CarSpecItemInput = z.infer<typeof carSpecItemSchema>;
