import { SiteHeaderClient } from "@/components/site/header-client";
import { getCarsOverlaySummary } from "@/lib/db/queries";
import type { Locale } from "@/lib/i18n/config";
import { getBodyTypeTranslationKey } from "@/lib/i18n/body-type";
import { getTranslator } from "@/lib/i18n/server";

type SiteHeaderProps = {
  locale: Locale;
};

export async function SiteHeader({ locale }: SiteHeaderProps) {
  const [cars, { t }] = await Promise.all([getCarsOverlaySummary(locale), getTranslator(locale)]);

  const localizedCars = cars.map((car) => {
    const bodyTypeKey = getBodyTypeTranslationKey(car.bodyType);

    return {
      ...car,
      bodyTypeLabel: bodyTypeKey ? t(bodyTypeKey) : car.bodyType,
    };
  });

  return (
    <SiteHeaderClient
      locale={locale}
      cars={localizedCars}
      labels={{
        brandName: t("brand.name"),
        navCars: t("nav.cars"),
        navBookTestDrive: t("nav.bookTestDrive"),
        navAbout: t("nav.about"),
        navContact: t("nav.contact"),
        bookTestDriveCta: t("header.bookTestDrive"),
        openCarsAriaLabel: t("header.openCarsAria"),
        openMenuAriaLabel: t("header.openMenuAria"),
        closeMenuAriaLabel: t("header.closeMenuAria"),
        languageSwitcherAriaLabel: t("header.languageSwitcherAria"),
        overlay: {
          dialogTitle: t("overlay.dialogTitle"),
          dialogDescription: t("overlay.dialogDescription"),
          closeAriaLabel: t("overlay.closeAria"),
          eyebrow: t("overlay.eyebrow"),
          title: t("overlay.title"),
          searchPlaceholder: t("overlay.searchPlaceholder"),
          viewAllModels: t("overlay.viewAllModels"),
          vehicleTypes: t("overlay.vehicleTypes"),
          bookTestDrive: t("overlay.bookTestDrive"),
          discoverModels: t("overlay.discoverModels"),
          emptyState: t("overlay.emptyState"),
          allTypes: t("overlay.allTypes"),
          from: t("common.from"),
        },
        adminShortcut: {
          hotkeyHint: t("admin.shortcut.hotkeyHint"),
          dialogTitle: t("admin.shortcut.dialogTitle"),
          dialogDescription: t("admin.shortcut.dialogDescription"),
          cancel: t("common.cancel"),
          continueWithGoogle: t("auth.continueWithGoogle"),
        },
      }}
    />
  );
}
