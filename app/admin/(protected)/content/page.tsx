import { ensureContentRowAction, updateHomepageContentAction } from "@/app/admin/(protected)/actions";
import { AdminFlashToast } from "@/components/admin/admin-flash-toast";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { HighlightsBuilderField, type HighlightDraft } from "@/components/admin/highlights-builder-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getContentEntryByKey } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type AdminContentPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

function toHighlights(value: unknown): HighlightDraft[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const typedItem = item as Record<string, unknown>;
      return {
        title: String(typedItem.title ?? ""),
        description: String(typedItem.description ?? ""),
      };
    })
    .filter((item): item is HighlightDraft => item !== null);
}

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
  const params = await searchParams;
  const entry = await getContentEntryByKey("homepage");

  const value = (entry?.value as Record<string, unknown> | undefined) ?? {};
  const hero = (value.hero as Record<string, unknown> | undefined) ?? {};
  const primaryCta = (hero.primaryCta as Record<string, unknown> | undefined) ?? {};
  const secondaryCta = (hero.secondaryCta as Record<string, unknown> | undefined) ?? {};
  const highlights = toHighlights(value.highlights);

  return (
    <div className="space-y-8">
      <AdminFlashToast
        status={params.status}
        error={params.error}
        statusMap={{ saved: "Homepage content saved" }}
      />

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Homepage Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage hero copy and highlight blocks. Slider visuals are managed in <code>/admin/homepage-slider</code>.
        </p>
      </div>

      {!entry ? (
        <Card className="bg-white/92">
          <CardContent className="pt-6">
            <p className="mb-3 text-sm text-muted-foreground">No homepage content record exists yet.</p>
            <form action={ensureContentRowAction}>
              <AdminSubmitButton pendingLabel="Initializing...">Initialize homepage content</AdminSubmitButton>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card className="bg-white/92">
        <CardHeader>
          <CardTitle>Homepage content</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateHomepageContentAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="eyebrow">Hero eyebrow</Label>
              <Input
                id="eyebrow"
                name="eyebrow"
                placeholder="New season collection"
                defaultValue={String(hero.eyebrow ?? "")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Hero title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Precision engineered for daily confidence."
                defaultValue={String(hero.title ?? "")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subtitle">Hero subtitle</Label>
              <Textarea
                id="subtitle"
                name="subtitle"
                rows={4}
                placeholder="From compact city crossovers to family-ready SUVs..."
                defaultValue={String(hero.subtitle ?? "")}
                required
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="primaryCtaLabel">Primary CTA label</Label>
                <Input
                  id="primaryCtaLabel"
                  name="primaryCtaLabel"
                  defaultValue={String(primaryCta.label ?? "Book a test drive")}
                  placeholder="Book a test drive"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="primaryCtaHref">Primary CTA link</Label>
                <Input
                  id="primaryCtaHref"
                  name="primaryCtaHref"
                  defaultValue={String(primaryCta.href ?? "/book-test-drive")}
                  placeholder="/book-test-drive"
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="secondaryCtaLabel">Secondary CTA label</Label>
                <Input
                  id="secondaryCtaLabel"
                  name="secondaryCtaLabel"
                  defaultValue={String(secondaryCta.label ?? "Browse models")}
                  placeholder="Browse models"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="secondaryCtaHref">Secondary CTA link</Label>
                <Input
                  id="secondaryCtaHref"
                  name="secondaryCtaHref"
                  defaultValue={String(secondaryCta.href ?? "/models")}
                  placeholder="/models"
                  required
                />
              </div>
            </div>

            <HighlightsBuilderField defaultValue={highlights} />

            <AdminSubmitButton className="w-fit" pendingLabel="Saving...">
              Save homepage content
            </AdminSubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
