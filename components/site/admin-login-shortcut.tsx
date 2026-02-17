"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useHotkeys } from "react-hotkeys-hook";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ADMIN_HOTKEY = "mod+shift+a";

export type AdminLoginShortcutLabels = {
  hotkeyHint: string;
  dialogTitle: string;
  dialogDescription: string;
  cancel: string;
  continueWithGoogle: string;
};

type AdminLoginShortcutProps = {
  labels: AdminLoginShortcutLabels;
};

export function AdminLoginShortcut({ labels }: AdminLoginShortcutProps) {
  const [isOpen, setIsOpen] = useState(false);

  useHotkeys(
    ADMIN_HOTKEY,
    (event) => {
      event.preventDefault();
      setIsOpen(true);
    },
    {
      preventDefault: true,
    },
    [],
  );

  useHotkeys(
    "escape",
    () => {
      setIsOpen(false);
    },
    { enabled: isOpen },
    [isOpen],
  );

  return (
    <>
      <span className="hidden text-xs text-muted-foreground sm:inline">{labels.hotkeyHint}</span>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md gap-0 rounded-3xl border border-border bg-card p-6 shadow-2xl">
          <DialogHeader className="gap-2">
            <DialogTitle id="admin-login-dialog-title" className="font-display text-2xl leading-tight font-semibold">
              {labels.dialogTitle}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">{labels.dialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              {labels.cancel}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                void signIn("google", { callbackUrl: "/admin" });
              }}
            >
              {labels.continueWithGoogle}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
