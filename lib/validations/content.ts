import { z } from "zod";

export const homepageContentSchema = z.object({
  eyebrow: z.string().trim().min(2).max(80),
  title: z.string().trim().min(8).max(140),
  subtitle: z.string().trim().min(20).max(300),
  primaryCtaLabel: z.string().trim().min(2).max(40),
  primaryCtaHref: z.string().trim().min(1),
  secondaryCtaLabel: z.string().trim().min(2).max(40),
  secondaryCtaHref: z.string().trim().min(1),
  highlightsJson: z.string().trim(),
});

export const highlightListSchema = z.array(
  z.object({
    title: z.string().trim().min(2).max(80),
    description: z.string().trim().min(6).max(200),
  }),
);
