import { createCarAction, deleteCarAction, updateCarAction } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAllCarsForAdmin } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type AdminCarsPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

export default async function AdminCarsPage({ searchParams }: AdminCarsPageProps) {
  const params = await searchParams;
  const cars = await getAllCarsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Cars CMS</h1>
        <p className="mt-1 text-sm text-slate-400">Create, update, and remove models.</p>
      </div>

      {params.status ? <p className="text-sm text-emerald-400">Success: {params.status}</p> : null}
      {params.error ? <p className="text-sm text-rose-400">Error: {params.error}</p> : null}

      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle>Create a new car</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCarAction} className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" placeholder="astra-suv-pro" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priceFrom">Price from</Label>
                <Input id="priceFrom" name="priceFrom" type="number" min={1} required />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="bodyType">Body type</Label>
                <Input id="bodyType" name="bodyType" placeholder="SUV" required />
              </div>
              <label className="mt-8 inline-flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" name="featured" className="h-4 w-4 rounded border-slate-700" />
                Featured model
              </label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={4} required />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="specsJson">Specs JSON</Label>
                <Textarea
                  id="specsJson"
                  name="specsJson"
                  rows={5}
                  defaultValue={JSON.stringify({ range: "520 km", drivetrain: "AWD", seats: "5" }, null, 2)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imagesJson">Images JSON</Label>
                <Textarea
                  id="imagesJson"
                  name="imagesJson"
                  rows={5}
                  defaultValue={JSON.stringify(["https://images.unsplash.com/photo-1502877338535-766e1452684a"], null, 2)}
                  required
                />
              </div>
            </div>
            <Button className="w-fit">Create car</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {cars.map((car) => (
          <Card key={car.id} className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="font-display text-xl">{car.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={updateCarAction} className="grid gap-4">
                <input type="hidden" name="id" value={car.id} />
                <div className="grid gap-3 md:grid-cols-3">
                  <Input name="name" defaultValue={car.name} required />
                  <Input name="slug" defaultValue={car.slug} required />
                  <Input name="priceFrom" type="number" defaultValue={car.priceFrom} min={1} required />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input name="bodyType" defaultValue={car.bodyType} required />
                  <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" name="featured" defaultChecked={car.featured} className="h-4 w-4 rounded border-slate-700" />
                    Featured model
                  </label>
                </div>
                <Textarea name="description" defaultValue={car.description} rows={3} required />
                <div className="grid gap-3 md:grid-cols-2">
                  <Textarea name="specsJson" defaultValue={JSON.stringify(car.specs, null, 2)} rows={4} required />
                  <Textarea name="imagesJson" defaultValue={JSON.stringify(car.images, null, 2)} rows={4} required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="secondary">
                    Save changes
                  </Button>
                </div>
              </form>
              <form action={deleteCarAction}>
                <input type="hidden" name="id" value={car.id} />
                <Button type="submit" variant="outline" className="border-rose-500/60 text-rose-300 hover:bg-rose-500/10">
                  Delete car
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
