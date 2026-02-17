"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

type GoogleSignInButtonProps = {
  className?: string;
};

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  return (
    <Button
      type="button"
      className={className}
      onClick={() => {
        void signIn("google", { callbackUrl: "/admin" });
      }}
    >
      Continue with Google
    </Button>
  );
}
