"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useHotkeys } from "react-hotkeys-hook";

import { Button } from "@/components/ui/button";

const ADMIN_HOTKEY = "mod+shift+a";

export function AdminLoginShortcut() {
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
      <span className="hidden text-xs text-muted-foreground sm:inline">Admin: Ctrl/Cmd + Shift + A</span>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-login-dialog-title"
            className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="admin-login-dialog-title" className="font-display text-2xl font-semibold">
              Admin login
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with your allowlisted Google account to open the CMS dashboard.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  void signIn("google", { callbackUrl: "/admin" });
                }}
              >
                Continue with Google
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
