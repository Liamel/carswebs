"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Suspense, useEffect, useState } from "react";

import {
  CarsOverlay,
  type CarsOverlayItem,
  type CarsOverlayLabels,
} from "@/components/site/cars-overlay";
import {
  AdminLoginShortcut,
  type AdminLoginShortcutLabels,
} from "@/components/site/admin-login-shortcut";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/path";

type SiteHeaderClientLabels = {
  brandName: string;
  navCars: string;
  navBookTestDrive: string;
  navAbout: string;
  navContact: string;
  bookTestDriveCta: string;
  openCarsAriaLabel: string;
  openMenuAriaLabel: string;
  closeMenuAriaLabel: string;
  languageSwitcherAriaLabel: string;
  overlay: CarsOverlayLabels;
  adminShortcut: AdminLoginShortcutLabels;
};

type SiteHeaderClientProps = {
  locale: Locale;
  cars: CarsOverlayItem[];
  labels: SiteHeaderClientLabels;
};

export function SiteHeaderClient({ locale, cars, labels }: SiteHeaderClientProps) {
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

  const navItems = [
    { href: withLocalePath(locale, "/book-test-drive"), label: labels.navBookTestDrive },
    { href: withLocalePath(locale, "/about"), label: labels.navAbout },
    { href: withLocalePath(locale, "/contact"), label: labels.navContact },
  ];

  return (
    <Dialog open={isCarsOverlayOpen} onOpenChange={setIsCarsOverlayOpen}>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between gap-2">
          <Link href={withLocalePath(locale, "/")} className="font-display text-lg font-semibold tracking-tight">
            {labels.brandName}
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-sm font-semibold text-foreground"
                aria-haspopup="dialog"
                aria-label={labels.openCarsAriaLabel}
              >
                {labels.navCars}
              </button>
            </DialogTrigger>

            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-semibold text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <AdminLoginShortcut labels={labels.adminShortcut} />
            <Suspense fallback={<div className="h-8 w-[7.5rem] rounded-full border border-border/80 bg-background/90" />}>
              <LanguageSwitcher currentLocale={locale} ariaLabel={labels.languageSwitcherAriaLabel} />
            </Suspense>
            <Link href={withLocalePath(locale, "/book-test-drive")} className="hidden sm:inline-flex">
              <Button size="sm">{labels.bookTestDriveCta}</Button>
            </Link>
            <button
              type="button"
              aria-label={isMobileMenuOpen ? labels.closeMenuAriaLabel : labels.openMenuAriaLabel}
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
                  {labels.navCars}
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

      <CarsOverlay locale={locale} cars={cars} labels={labels.overlay} />
    </Dialog>
  );
}
