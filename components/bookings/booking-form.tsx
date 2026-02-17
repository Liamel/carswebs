"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { submitBookingAction, type BookingActionState } from "@/app/book-test-drive/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ModelOption = {
  id: number;
  name: string;
  slug: string;
};

type BookingFormProps = {
  models: ModelOption[];
  defaultModel?: string;
};

const initialState: BookingActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Submitting..." : "Submit booking"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return <p className="text-sm text-rose-600">{errors[0]}</p>;
}

export function BookingForm({ models, defaultModel }: BookingFormProps) {
  const [state, formAction] = useActionState(submitBookingAction, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required />
        <FieldError errors={state.fieldErrors?.name} />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required />
          <FieldError errors={state.fieldErrors?.phone} />
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="preferredModel">Preferred model</Label>
          <select
            id="preferredModel"
            name="preferredModel"
            defaultValue={defaultModel ?? ""}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="">Any model</option>
            {models.map((model) => (
              <option key={model.id} value={model.slug}>
                {model.name}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.preferredModel} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="preferredDateTime">Preferred date/time</Label>
          <Input id="preferredDateTime" name="preferredDateTime" type="datetime-local" required />
          <FieldError errors={state.fieldErrors?.preferredDateTime} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Preferred location</Label>
        <Input id="location" name="location" placeholder="City or dealership" required />
        <FieldError errors={state.fieldErrors?.location} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" name="note" rows={4} />
        <FieldError errors={state.fieldErrors?.note} />
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
