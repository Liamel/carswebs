"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast: "rounded-xl border border-border bg-card text-card-foreground shadow-md",
          title: "text-sm font-medium",
          description: "text-xs text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
