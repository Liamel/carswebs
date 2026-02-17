import { updateBookingStatusAction } from "@/app/admin/(protected)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBookingsForAdmin } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type AdminBookingsPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

function statusBadge(status: string) {
  if (status === "CONFIRMED") {
    return <Badge variant="success">CONFIRMED</Badge>;
  }
  if (status === "CANCELLED") {
    return <Badge variant="destructive">CANCELLED</Badge>;
  }
  return <Badge variant="warning">PENDING</Badge>;
}

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  const params = await searchParams;
  const bookingRows = await getBookingsForAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Bookings</h1>
        <p className="mt-1 text-sm text-slate-400">Review booking requests and update their status.</p>
      </div>

      {params.status ? <p className="text-sm text-emerald-400">Success: {params.status}</p> : null}
      {params.error ? <p className="text-sm text-rose-400">Error: {params.error}</p> : null}

      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle>All bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-900">
                <TableHead>Customer</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Date/time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingRows.map((row) => (
                <TableRow key={row.id} className="border-slate-800 hover:bg-slate-900">
                  <TableCell>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-slate-400">{row.email}</div>
                    <div className="text-xs text-slate-500">{row.phone}</div>
                  </TableCell>
                  <TableCell>{row.carName ?? "Any model"}</TableCell>
                  <TableCell>{new Date(row.preferredDateTime).toLocaleString()}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{statusBadge(row.status)}</TableCell>
                  <TableCell>
                    <form action={updateBookingStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={row.id} />
                      <select
                        name="status"
                        defaultValue={row.status}
                        className="h-9 rounded-lg border border-slate-700 bg-slate-900 px-2 text-xs"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <Button type="submit" size="sm" variant="outline" className="border-slate-700 bg-transparent text-slate-100">
                        Save
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
