import { createCarAction, deleteCarAction, updateCarAction } from "@/app/admin/(protected)/actions";
import { AdminFlashToast } from "@/components/admin/admin-flash-toast";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { CarFormFields, type CarSpecDraft } from "@/components/admin/car-form-fields";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BODY_TYPE_OPTIONS } from "@/lib/constants/body-types";
import { getAllCarsForAdmin } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type AdminCarsPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

function toSpecRows(specs: Record<string, string>): CarSpecDraft[] {
  return Object.entries(specs).map(([label, value]) => ({ label, value }));
}

export default async function AdminCarsPage({ searchParams }: AdminCarsPageProps) {
  const params = await searchParams;
  const cars = await getAllCarsForAdmin();

  return (
    <div className="space-y-8">
      <AdminFlashToast
        status={params.status}
        error={params.error}
        statusMap={{
          created: "Car created",
          updated: "Car updated",
          deleted: "Car deleted",
        }}
      />

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Cars CMS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage models shown on <code>/models</code>. Slugs are generated automatically from model names.
        </p>
      </div>

      <Card className="bg-white/92">
        <CardHeader>
          <CardTitle>Create a new car</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCarAction} className="grid gap-4">
            <CarFormFields idPrefix="create-car" bodyTypeOptions={[...BODY_TYPE_OPTIONS]} initialFeatured={true} />
            <AdminSubmitButton className="w-fit" pendingLabel="Creating...">
              Create car
            </AdminSubmitButton>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {cars.map((car) => {
          const specs = toSpecRows(car.specs);
          const previewImage = car.images[0] ?? "";
          const deleteFormId = `delete-car-${car.id}`;

          return (
            <Card key={car.id} className="bg-white/92">
              <CardHeader>
                <CardTitle className="font-display text-2xl capitalize">{car.nameGeo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewImage ? (
                  <div className="hero-shine rounded-2xl border border-border/70 p-3">
                    <div
                      className="h-36 w-full"
                      style={{
                        backgroundImage: `url(${previewImage})`,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  </div>
                ) : null}

                <form action={updateCarAction} className="grid gap-4">
                  <input type="hidden" name="id" value={car.id} />
                  <CarFormFields
                    idPrefix={`edit-car-${car.id}`}
                    bodyTypeOptions={[...BODY_TYPE_OPTIONS]}
                    initialNameGeo={car.nameGeo}
                    initialNameEn={car.nameEn}
                    initialNameRu={car.nameRu}
                    initialSlug={car.slug}
                    initialPriceFrom={car.priceFrom}
                    initialBodyType={car.bodyType}
                    initialFeatured={car.featured}
                    initialDescriptionGeo={car.descriptionGeo}
                    initialDescriptionEn={car.descriptionEn}
                    initialDescriptionRu={car.descriptionRu}
                    initialImages={car.images}
                    initialSpecs={specs}
                  />
                  <div className="flex gap-2">
                    <AdminSubmitButton variant="secondary" pendingLabel="Saving...">
                      Save changes
                    </AdminSubmitButton>
                  </div>
                </form>

                <form id={deleteFormId} action={deleteCarAction}>
                  <input type="hidden" name="id" value={car.id} />
                </form>
                <DeleteConfirmButton formId={deleteFormId} message="Delete this car permanently?" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
