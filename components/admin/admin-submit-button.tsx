"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type AdminSubmitButtonProps = ComponentProps<typeof Button> & {
  pendingLabel?: string;
};

export function AdminSubmitButton({
  children,
  pendingLabel = "Saving...",
  disabled,
  ...buttonProps
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...buttonProps} type="submit" disabled={pending || disabled}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
