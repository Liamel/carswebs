"use client";

import { useEffect, useMemo } from "react";
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

function buildToastId(type: "error" | "status", message: string) {
  return `admin-flash-${type}-${encodeURIComponent(message)}`;
}

export function AdminFlashToast({ status, error, statusMap }: AdminFlashToastProps) {
  const errorMessage = useMemo(() => {
    if (!error) {
      return null;
    }

    return normalizeMessage(error);
  }, [error]);

  const statusMessage = useMemo(() => {
    if (!status) {
      return null;
    }

    return statusMap?.[status] ?? normalizeMessage(status);
  }, [status, statusMap]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    toast.error(errorMessage, { id: buildToastId("error", errorMessage) });
  }, [errorMessage]);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    toast.success(statusMessage, { id: buildToastId("status", statusMessage) });
  }, [statusMessage]);

  return null;
}
