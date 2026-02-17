"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { CarsOverlay, type CarsOverlayItem } from "@/components/site/cars-overlay";
import { AdminLoginShortcut } from "@/components/site/admin-login-shortcut";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

type SiteHeaderClientProps = {
  cars: CarsOverlayItem[];
};

const navItems = [
  { href: "/book-test-drive", label: "Book Test Drive" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeaderClient({ cars }: SiteHeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCarsOverlayOpen, setIsCarsOverlayOpen] = useState(false);

  useEffect(() => {
    if (!isCarsOverlayOpen) {
      return;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isCarsOverlayOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Dialog open={isCarsOverlayOpen} onOpenChange={setIsCarsOverlayOpen}>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">
            Astra Motors
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-sm font-semibold text-foreground"
                aria-haspopup="dialog"
                aria-label="Open cars showcase"
              >
                Cars
              </button>
            </DialogTrigger>

            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-semibold text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <AdminLoginShortcut />
            <Link href="/book-test-drive" className="hidden sm:inline-flex">
              <Button size="sm">Book a test drive</Button>
            </Link>
            <button
              type="button"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background md:hidden"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-border/70 bg-background px-4 py-4 md:hidden">
            <nav className="space-y-2">
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="block w-full rounded-xl border border-border/70 px-3 py-2 text-left text-sm"
                  aria-haspopup="dialog"
                  onClick={closeMobileMenu}
                >
                  Cars
                </button>
              </DialogTrigger>

              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-xl border border-border/70 px-3 py-2 text-sm"
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </header>

      <CarsOverlay cars={cars} />
    </Dialog>
  );
}
