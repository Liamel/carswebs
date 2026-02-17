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
];

export function AdminShell({ children, email }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="container-shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-lg font-semibold">
              Astra CMS
            </Link>
            <nav className="hidden gap-4 md:flex">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="text-sm text-slate-300 transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-400 md:inline">{email}</span>
            <Link href="/api/auth/signout?callbackUrl=/">
              <Button variant="outline" size="sm" className="border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800">
                Sign out
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="container-shell py-8">{children}</main>
    </div>
  );
}
