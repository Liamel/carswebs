import Link from "next/link";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/models", label: "Models" },
  { href: "/book-test-drive", label: "Book Test Drive" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          Astra Motors
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted-foreground transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/admin/login" className="hidden sm:block">
            <Button variant="outline" size="sm">Admin</Button>
          </Link>
          <Link href="/book-test-drive">
            <Button size="sm">Book a test drive</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
