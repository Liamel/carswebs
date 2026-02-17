import {
  createHomepageSlideAction,
  deleteHomepageSlideAction,
  moveHomepageSlideOrderAction,
  updateHomepageSlideAction,
} from "@/app/admin/(protected)/actions";
import { AdminFlashToast } from "@/components/admin/admin-flash-toast";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getHomepageSlidesForAdmin } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type AdminHomepageSliderPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

function formatDate(timestamp: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default async function AdminHomepageSliderPage({ searchParams }: AdminHomepageSliderPageProps) {
  const params = await searchParams;
  const slides = await getHomepageSlidesForAdmin();

  return (
    <div className="space-y-8">
      <AdminFlashToast
        status={params.status}
        error={params.error}
        statusMap={{
          created: "Slide created",
          updated: "Slide updated",
          deleted: "Slide deleted",
          reordered: "Slide order updated",
        }}
      />

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Homepage Slider</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage slider visuals and hero copy shown on the homepage carousel.
        </p>
      </div>

      <details className="rounded-2xl border border-border/80 bg-white/92 shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-3">
          <span className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">
            Add slide
          </span>
        </summary>
        <div className="border-t border-border/70 px-4 py-4">
          <form action={createHomepageSlideAction} encType="multipart/form-data" className="grid gap-4 [&_input]:bg-white [&_textarea]:bg-white">
            <div className="grid gap-3 md:grid-cols-2">
              <Input name="title" placeholder="Title" required />
              <Input name="sortOrder" type="number" min={0} defaultValue={slides.length} placeholder="Sort order" />
            </div>
            <Textarea name="description" rows={3} placeholder="Description (optional)" />
            <div className="grid gap-3 md:grid-cols-2">
              <Input name="ctaLabel" placeholder="CTA label (optional)" />
              <Input name="ctaHref" placeholder="CTA link (optional, e.g. /models)" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Slide image</label>
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                required
                className="h-11 rounded-xl border border-border bg-white px-3 text-sm"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-border accent-primary" />
              Active slide
            </label>
            <AdminSubmitButton className="w-fit" pendingLabel="Creating...">
              Create slide
            </AdminSubmitButton>
          </form>
        </div>
      </details>

      <Card className="bg-white/92">
        <CardHeader>
          <CardTitle>Slides</CardTitle>
        </CardHeader>
        <CardContent>
          {slides.length === 0 ? (
            <p className="text-sm text-muted-foreground">No slides yet. Add one to populate the homepage carousel.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[120px]">Active</TableHead>
                  <TableHead className="w-[110px]">Sort order</TableHead>
                  <TableHead className="w-[180px]">Created</TableHead>
                  <TableHead className="w-[330px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slides.map((slide, index) => {
                  const updateFormId = `update-slide-${slide.id}`;
                  const deleteFormId = `delete-slide-${slide.id}`;
                  const moveUpFormId = `move-up-slide-${slide.id}`;
                  const moveDownFormId = `move-down-slide-${slide.id}`;

                  return (
                    <TableRow key={slide.id}>
                      <TableCell>
                        <div
                          className="h-16 w-28 rounded-lg border border-border/70 bg-muted"
                          style={{
                            backgroundImage: `url(${slide.imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Input form={updateFormId} name="title" defaultValue={slide.title} required />
                          <Textarea form={updateFormId} name="description" defaultValue={slide.description ?? ""} rows={2} placeholder="Description" />
                          <div className="grid gap-2">
                            <Input form={updateFormId} name="ctaLabel" defaultValue={slide.ctaLabel ?? ""} placeholder="CTA label" />
                            <Input form={updateFormId} name="ctaHref" defaultValue={slide.ctaHref ?? ""} placeholder="CTA link" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            form={updateFormId}
                            type="checkbox"
                            name="isActive"
                            defaultChecked={slide.isActive}
                            className="h-4 w-4 rounded border-border accent-primary"
                          />
                          Enabled
                        </label>
                      </TableCell>
                      <TableCell>
                        <Input form={updateFormId} type="number" min={0} name="sortOrder" defaultValue={slide.sortOrder} />
                      </TableCell>
                      <TableCell>{formatDate(slide.createdAt)}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <input form={updateFormId} type="file" name="imageFile" accept="image/*" className="h-9 w-full rounded-lg border border-border bg-white px-2 text-xs" />
                          <p className="text-xs text-muted-foreground">Leave image empty to keep the current file.</p>

                          <div className="flex flex-wrap gap-2">
                            <form id={updateFormId} action={updateHomepageSlideAction} encType="multipart/form-data">
                              <input type="hidden" name="id" value={slide.id} />
                              <input type="hidden" name="existingImageUrl" value={slide.imageUrl} />
                            </form>
                            <AdminSubmitButton form={updateFormId} size="sm" variant="secondary" pendingLabel="Saving...">
                              Save
                            </AdminSubmitButton>

                            <form id={moveUpFormId} action={moveHomepageSlideOrderAction}>
                              <input type="hidden" name="id" value={slide.id} />
                              <input type="hidden" name="direction" value="up" />
                            </form>
                            <AdminSubmitButton
                              form={moveUpFormId}
                              size="sm"
                              variant="outline"
                              pendingLabel="Moving..."
                              disabled={index === 0}
                            >
                              Move up
                            </AdminSubmitButton>

                            <form id={moveDownFormId} action={moveHomepageSlideOrderAction}>
                              <input type="hidden" name="id" value={slide.id} />
                              <input type="hidden" name="direction" value="down" />
                            </form>
                            <AdminSubmitButton
                              form={moveDownFormId}
                              size="sm"
                              variant="outline"
                              pendingLabel="Moving..."
                              disabled={index === slides.length - 1}
                            >
                              Move down
                            </AdminSubmitButton>

                            <form id={deleteFormId} action={deleteHomepageSlideAction}>
                              <input type="hidden" name="id" value={slide.id} />
                            </form>
                            <DeleteConfirmButton formId={deleteFormId} message="Delete this slide permanently?" />
                          </div>
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
