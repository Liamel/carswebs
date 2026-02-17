"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogIconClose, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type BookingDetailsDialogProps = {
  customerName: string;
  email: string;
  phone: string;
  modelName: string;
  location: string;
  preferredDateTimeLabel: string;
  note: string | null;
  createdAtLabel: string;
  triggerClassName?: string;
};

export function BookingDetailsDialog({
  customerName,
  email,
  phone,
  modelName,
  location,
  preferredDateTimeLabel,
  note,
  createdAtLabel,
  triggerClassName,
}: BookingDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className={triggerClassName}>
          View details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{customerName}</DialogTitle>
          <DialogDescription>Booking request received on {createdAtLabel}.</DialogDescription>
        </DialogHeader>
        <DialogIconClose aria-label="Close booking details" />

        <dl className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm">
          <div className="grid gap-1">
            <dt className="text-xs font-medium text-muted-foreground">Email</dt>
            <dd>{email}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-xs font-medium text-muted-foreground">Phone</dt>
            <dd>{phone}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-xs font-medium text-muted-foreground">Preferred model</dt>
            <dd>{modelName}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-xs font-medium text-muted-foreground">Preferred date and time</dt>
            <dd>{preferredDateTimeLabel}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-xs font-medium text-muted-foreground">Location</dt>
            <dd>{location}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-xs font-medium text-muted-foreground">Customer notes</dt>
            <dd>{note?.trim() ? note : "No notes provided."}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
