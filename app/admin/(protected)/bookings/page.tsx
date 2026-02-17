import Link from "next/link";

import { updateBookingStatusAction } from "@/app/admin/(protected)/actions";
import { AdminFlashToast } from "@/components/admin/admin-flash-toast";
import { BookingDetailsDialog } from "@/components/admin/booking-details-dialog";
import { BookingsFilters } from "@/components/admin/bookings-filters";
import { BookingStatusSelect } from "@/components/admin/booking-status-select";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getBookingsForAdmin } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type FilterValue = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED";

type AdminBookingsPageProps = {
  searchParams: Promise<{ status?: string; error?: string; filter?: string; q?: string; page?: string }>;
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

function normalizeFilter(input: string | undefined): FilterValue {
  if (input === "PENDING" || input === "CONFIRMED" || input === "CANCELLED") {
    return input;
  }

  return "ALL";
}

function normalizePage(input: string | undefined) {
  const parsed = Number.parseInt(input ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildReturnToPath(filter: FilterValue, query: string, page = 1) {
  const searchParams = new URLSearchParams();

  if (filter !== "ALL") {
    searchParams.set("filter", filter);
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery) {
    searchParams.set("q", trimmedQuery);
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const serialized = searchParams.toString();
  return serialized ? `/admin/bookings?${serialized}` : "/admin/bookings";
}

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  const params = await searchParams;
  const activeFilter = normalizeFilter(params.filter);
  const activeQuery = params.q?.trim() ?? "";
  const activePage = normalizePage(params.page);
  const bookingResult = await getBookingsForAdmin({
    status: activeFilter === "ALL" ? undefined : activeFilter,
    search: activeQuery || undefined,
    page: activePage,
    pageSize: 20,
  });
  const bookingRows = bookingResult.rows;
  const returnTo = buildReturnToPath(activeFilter, activeQuery, bookingResult.page);
  const hasPreviousPage = bookingResult.page > 1;
  const hasNextPage = bookingResult.page < bookingResult.totalPages;

  return (
    <div className="space-y-8">
      <AdminFlashToast
        status={params.status}
        error={params.error}
        statusMap={{
          updated: "Booking status saved",
        }}
      />

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Filter requests, review customer details, and update booking status.</p>
      </div>

      <BookingsFilters initialFilter={activeFilter} initialQuery={activeQuery} />

      <Card className="bg-white/92">
        <CardHeader>
          <CardTitle>All bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Showing {bookingRows.length} of {bookingResult.totalRows} bookings
            </p>
            <p className="text-xs text-muted-foreground">
              Page {bookingResult.page} of {bookingResult.totalPages}
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Date/time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[300px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No bookings match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                bookingRows.map((row) => {
                  const preferredDateLabel = new Date(row.preferredDateTime).toLocaleString();
                  const createdAtLabel = new Date(row.createdAt).toLocaleString();

                  return (
                    <TableRow key={row.id}>
                      <TableCell className="py-2.5">
                        <div className="font-medium capitalize">{row.name}</div>
                        <div className="text-xs leading-tight text-muted-foreground">{row.email}</div>
                        <div className="text-xs leading-tight text-muted-foreground">{row.phone}</div>
                      </TableCell>
                      <TableCell className="py-2.5 whitespace-nowrap">{row.carName ?? "Any model"}</TableCell>
                      <TableCell className="py-2.5 whitespace-nowrap text-sm text-muted-foreground">{preferredDateLabel}</TableCell>
                      <TableCell className="py-2.5 whitespace-nowrap">{row.location}</TableCell>
                      <TableCell className="py-2.5 align-center">{statusBadge(row.status)}</TableCell>
                      <TableCell className="py-2.5 align-center">
                        <div className="flex flex-nowrap items-center align-center justify-end gap-2 whitespace-nowrap">
                          <BookingDetailsDialog
                            customerName={row.name}
                            email={row.email}
                            phone={row.phone}
                            modelName={row.carName ?? "Any model"}
                            location={row.location}
                            preferredDateTimeLabel={preferredDateLabel}
                            note={row.note}
                            createdAtLabel={createdAtLabel}
                            triggerClassName="h-8 px-3 text-xs"
                          />
                          <form action={updateBookingStatusAction} className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap">
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="returnTo" value={returnTo} />
                            <BookingStatusSelect name="status" defaultValue={row.status} />
                            <AdminSubmitButton size="sm" variant="outline" className="h-8 px-3 text-xs" pendingLabel="Saving...">
                              Save
                            </AdminSubmitButton>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-end gap-2">
            {hasPreviousPage ? (
              <Link href={buildReturnToPath(activeFilter, activeQuery, bookingResult.page - 1)}>
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </Link>
            ) : null}
            {hasNextPage ? (
              <Link href={buildReturnToPath(activeFilter, activeQuery, bookingResult.page + 1)}>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </Link>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
