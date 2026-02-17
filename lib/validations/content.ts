import { z } from "zod";

const highlightItemSchema = z.object({
  title: z.string().trim().min(2, "Highlight title must be at least 2 characters").max(80),
  description: z.string().trim().min(6, "Highlight description must be at least 6 characters").max(200),
});

export const highlightListSchema = z.array(highlightItemSchema).max(20, "Maximum 20 highlights");

function parseHighlightsPayload(value: string, ctx: z.RefinementCtx) {
  try {
    const parsed = JSON.parse(value);
    const validated = highlightListSchema.safeParse(parsed);

    if (!validated.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validated.error.issues[0]?.message ?? "Highlights are invalid",
      });
      return z.NEVER;
    }

    return validated.data;
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Highlights payload is invalid",
    });
    return z.NEVER;
  }
}

export const homepageContentSchema = z.object({
  eyebrow: z.string().trim().min(2).max(80),
  title: z.string().trim().min(8).max(140),
  subtitle: z.string().trim().min(20).max(300),
  primaryCtaLabel: z.string().trim().min(2).max(40),
  primaryCtaHref: z.string().trim().min(1),
  secondaryCtaLabel: z.string().trim().min(2).max(40),
  secondaryCtaHref: z.string().trim().min(1),
  highlightsPayload: z.string().trim().transform((value, ctx) => parseHighlightsPayload(value, ctx)),
});

export type HighlightItemInput = z.infer<typeof highlightItemSchema>;
