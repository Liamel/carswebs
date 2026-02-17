import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/auth";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({ children }: ProtectedAdminLayoutProps) {
  const session = await requireAdminSession();

  if (!session?.user?.email) {
    redirect("/admin/login?error=Unauthorized");
  }

  return <AdminShell email={session.user.email}>{children}</AdminShell>;
}
