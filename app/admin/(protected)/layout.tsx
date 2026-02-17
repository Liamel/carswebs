import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminCommandPalette } from "@/components/admin/admin-command-palette";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/auth";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getAdminCommandPaletteLabels } from "@/lib/i18n/admin-command-palette-labels";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({ children }: ProtectedAdminLayoutProps) {
  const session = await requireAdminSession();

  if (!session?.user?.email) {
    redirect("/admin/login?error=Unauthorized");
  }

  const paletteLabels = await getAdminCommandPaletteLabels(DEFAULT_LOCALE);

  return (
    <AdminShell email={session.user.email}>
      {children}
      <AdminCommandPalette isAdmin labels={paletteLabels} />
    </AdminShell>
  );
}
