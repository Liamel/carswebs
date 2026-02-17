import { z } from "zod";

const jsonRecordSchema = z
  .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
  .transform((value) => Object.fromEntries(Object.entries(value).map(([k, v]) => [k, String(v)])));

const jsonArraySchema = z.array(z.string().trim().min(1));

export const carSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9-]+$/, "Slug must contain lowercase letters, numbers, and hyphens only"),
  priceFrom: z.coerce.number().int().positive(),
  bodyType: z.string().trim().min(2).max(80),
  description: z.string().trim().min(20).max(4000),
  featured: z.coerce.boolean().default(false),
  specsJson: z.string().trim().transform((value, ctx) => {
    try {
      const parsed = JSON.parse(value);
      const validated = jsonRecordSchema.safeParse(parsed);

      if (!validated.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON for specs",
        });
        return z.NEVER;
      }

      return validated.data;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON for specs",
      });
      return z.NEVER;
    }
  }),
  imagesJson: z.string().trim().transform((value, ctx) => {
    try {
      const parsed = JSON.parse(value);
      const validated = jsonArraySchema.safeParse(parsed);

      if (!validated.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON for images",
        });
        return z.NEVER;
      }

      return validated.data;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid JSON for images",
      });
      return z.NEVER;
    }
  }),
});

export type CarInput = z.infer<typeof carSchema>;
