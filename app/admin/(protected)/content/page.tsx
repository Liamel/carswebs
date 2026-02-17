import {
  ensureContentRowAction,
  updateHomepageContentAction,
} from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getContentEntryByKey } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type AdminContentPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
  const params = await searchParams;
  const entry = await getContentEntryByKey("homepage");

  const value = (entry?.value as Record<string, unknown> | undefined) ?? {};
  const hero = (value.hero as Record<string, unknown> | undefined) ?? {};
  const primaryCta = (hero.primaryCta as Record<string, unknown> | undefined) ?? {};
  const secondaryCta = (hero.secondaryCta as Record<string, unknown> | undefined) ?? {};
  const highlights = Array.isArray(value.highlights) ? value.highlights : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Homepage CMS</h1>
        <p className="mt-1 text-sm text-slate-400">Manage hero text and highlights used by the public homepage.</p>
      </div>

      {params.status ? <p className="text-sm text-emerald-400">Success: {params.status}</p> : null}
      {params.error ? <p className="text-sm text-rose-400">Error: {params.error}</p> : null}

      {!entry ? (
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="pt-6">
            <p className="mb-3 text-sm text-slate-300">No homepage content record exists yet.</p>
            <form action={ensureContentRowAction}>
              <Button>Initialize homepage content</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle>Homepage content</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateHomepageContentAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="eyebrow">Eyebrow</Label>
              <Input id="eyebrow" name="eyebrow" defaultValue={String(hero.eyebrow ?? "")} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={String(hero.title ?? "")} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea id="subtitle" name="subtitle" rows={4} defaultValue={String(hero.subtitle ?? "")} required />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="primaryCtaLabel">Primary CTA label</Label>
                <Input
                  id="primaryCtaLabel"
                  name="primaryCtaLabel"
                  defaultValue={String(primaryCta.label ?? "Book a test drive")}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="primaryCtaHref">Primary CTA href</Label>
                <Input
                  id="primaryCtaHref"
                  name="primaryCtaHref"
                  defaultValue={String(primaryCta.href ?? "/book-test-drive")}
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
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="secondaryCtaHref">Secondary CTA href</Label>
                <Input
                  id="secondaryCtaHref"
                  name="secondaryCtaHref"
                  defaultValue={String(secondaryCta.href ?? "/models")}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="highlightsJson">Highlights JSON</Label>
              <Textarea
                id="highlightsJson"
                name="highlightsJson"
                rows={8}
                defaultValue={JSON.stringify(highlights, null, 2)}
                required
              />
            </div>
            <Button className="w-fit">Save homepage content</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
