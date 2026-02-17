import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardStats, getRecentBookings } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, recentBookings] = await Promise.all([getDashboardStats(), getRecentBookings(6)]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of inventory and booking activity.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground uppercase">Total cars</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-semibold">{stats.totalCars}</CardContent>
        </Card>
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground uppercase">Total bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-semibold">{stats.totalBookings}</CardContent>
        </Card>
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground uppercase">Pending bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-semibold">{stats.pendingBookings}</CardContent>
        </Card>
        <Card className="bg-white/90">
          <CardHeader>
            <CardTitle className="text-xs text-muted-foreground uppercase">Featured cars</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-semibold">{stats.featuredCars}</CardContent>
        </Card>
      </section>

      <Card className="bg-white/92">
        <CardHeader>
          <CardTitle>Recent bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((booking) => (
                <TableRow key={booking.id}>
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
