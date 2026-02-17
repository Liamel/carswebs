"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type AdminFlashToastProps = {
  status?: string;
  error?: string;
  statusMap?: Record<string, string>;
};

function normalizeMessage(value: string) {
  return value
    .replace(/[+_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function AdminFlashToast({ status, error, statusMap }: AdminFlashToastProps) {
  useEffect(() => {
    if (error) {
      toast.error(normalizeMessage(error));
    }
  }, [error]);

  useEffect(() => {
    if (!status) {
      return;
    }

    const mappedMessage = statusMap?.[status] ?? normalizeMessage(status);
    toast.success(mappedMessage);
  }, [status, statusMap]);

  return null;
}
