import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardStats, getRecentBookings } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, recentBookings] = await Promise.all([getDashboardStats(), getRecentBookings(6)]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Overview of inventory and booking activity.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Total cars</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{stats.totalCars}</CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Total bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{stats.totalBookings}</CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Pending bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{stats.pendingBookings}</CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Featured cars</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{stats.featuredCars}</CardContent>
        </Card>
      </section>

      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle>Recent bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-800 hover:bg-slate-900">
                <TableHead>Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((booking) => (
                <TableRow key={booking.id} className="border-slate-800 hover:bg-slate-900">
                  <TableCell>{booking.name}</TableCell>
                  <TableCell>{booking.carName ?? "Any"}</TableCell>
                  <TableCell>
                    {booking.status === "PENDING" ? <Badge variant="warning">PENDING</Badge> : null}
                    {booking.status === "CONFIRMED" ? <Badge variant="success">CONFIRMED</Badge> : null}
                    {booking.status === "CANCELLED" ? <Badge variant="destructive">CANCELLED</Badge> : null}
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
