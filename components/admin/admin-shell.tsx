import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type AdminShellProps = {
  children: ReactNode;
  email?: string | null;
};

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cars", label: "Cars" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/homepage-slider", label: "Homepage Slider" },
];

export function AdminShell({ children, email }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#edf1f7_100%)] text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-white/92 shadow-sm backdrop-blur">
        <div className="container-shell flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display text-lg font-semibold tracking-tight">
              Astra CMS
            </Link>
            <nav className="hidden flex-wrap gap-2 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-transparent px-3 py-1.5 text-sm text-muted-foreground transition hover:border-border/80 hover:bg-muted/60 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground md:inline">{email}</span>
            <Link href="/api/auth/signout?callbackUrl=/">
              <Button variant="outline" size="sm">
                Sign out
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="container-shell py-8 md:py-10">{children}</main>
    </div>
  );
}
