import {
  createI18nStringAction,
  deleteI18nStringAction,
  updateI18nStringAction,
} from "@/app/admin/(protected)/actions";
import { AdminFlashToast } from "@/components/admin/admin-flash-toast";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getI18nStringsForAdmin } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type AdminI18nPageProps = {
  searchParams: Promise<{ status?: string; error?: string; q?: string; missing?: string }>;
};

function formatDate(timestamp: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default async function AdminI18nPage({ searchParams }: AdminI18nPageProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const missingOnly = params.missing === "1";
  const rows = await getI18nStringsForAdmin({
    search: search || undefined,
    missingOnly,
  });

  return (
    <div className="space-y-8">
      <AdminFlashToast
        status={params.status}
        error={params.error}
        statusMap={{
          created: "Translation created",
          updated: "Translation updated",
          deleted: "Translation deleted",
        }}
      />

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">I18n Strings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage translation keys used by the public website. All fields are plain text inputs, no JSON required.
        </p>
      </div>

      <Card className="bg-white/92">
        <CardContent className="pt-6">
          <form method="GET" className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor="i18n-search">Search key or value</Label>
              <Input id="i18n-search" name="q" defaultValue={search} placeholder="nav.cars, Book test drive, ..." />
            </div>
            <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="missing"
                value="1"
                defaultChecked={missingOnly}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Missing translations only
            </label>
            <Button type="submit" className="h-11">
              Apply filters
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white/92">
        <CardHeader>
          <CardTitle>Create translation</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createI18nStringAction} className="grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="create-key">Key</Label>
                <Input id="create-key" name="key" placeholder="home.hero.title" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="create-description">Description (optional)</Label>
                <Input id="create-description" name="description" placeholder="Homepage hero title" />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="create-geo">GEO</Label>
                <Textarea id="create-geo" name="geo" rows={3} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="create-en">ENG</Label>
                <Textarea id="create-en" name="en" rows={3} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="create-ru">RUS</Label>
                <Textarea id="create-ru" name="ru" rows={3} required />
              </div>
            </div>
            <AdminSubmitButton className="w-fit" pendingLabel="Creating...">
              Create string
            </AdminSubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white/92">
        <CardHeader>
          <CardTitle>Strings</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No translation strings match the current filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[260px]">Key</TableHead>
                  <TableHead>GEO</TableHead>
                  <TableHead>ENG</TableHead>
                  <TableHead>RUS</TableHead>
                  <TableHead className="w-[170px]">Updated</TableHead>
                  <TableHead className="w-[220px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const updateFormId = `update-i18n-${row.id}`;
                  const deleteFormId = `delete-i18n-${row.id}`;

                  return (
                    <TableRow key={row.id}>
                      <TableCell className="align-top">
                        <div className="space-y-2">
                          <Input form={updateFormId} name="key" defaultValue={row.key} required />
                          <Input
                            form={updateFormId}
                            name="description"
                            defaultValue={row.description ?? ""}
                            placeholder="Description"
                            className="text-xs"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Textarea form={updateFormId} name="geo" rows={4} defaultValue={row.geo} required />
                      </TableCell>
                      <TableCell className="align-top">
                        <Textarea form={updateFormId} name="en" rows={4} defaultValue={row.en} required />
                      </TableCell>
                      <TableCell className="align-top">
                        <Textarea form={updateFormId} name="ru" rows={4} defaultValue={row.ru} required />
                      </TableCell>
                      <TableCell className="align-top text-xs text-muted-foreground">{formatDate(row.updatedAt)}</TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-2">
                          <form id={updateFormId} action={updateI18nStringAction}>
                            <input type="hidden" name="id" value={row.id} />
                          </form>
                          <AdminSubmitButton form={updateFormId} className="w-full" pendingLabel="Saving...">
                            Save
                          </AdminSubmitButton>

                          <form id={deleteFormId} action={deleteI18nStringAction}>
                            <input type="hidden" name="id" value={row.id} />
                          </form>
                          <DeleteConfirmButton formId={deleteFormId} message="Delete this translation string permanently?" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
