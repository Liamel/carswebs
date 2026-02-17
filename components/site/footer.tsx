import Link from "next/link";

import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/path";
import { getTranslator } from "@/lib/i18n/server";

type SiteFooterProps = {
  locale: Locale;
};

export async function SiteFooter({ locale }: SiteFooterProps) {
  const { t } = await getTranslator(locale);

  return (
    <footer className="mt-20 border-t border-border/70 bg-white/45 py-12">
      <div className="container-shell grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg font-semibold">{t("brand.name")}</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("footer.description")}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">{t("footer.explore")}</h4>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <Link className="block hover:text-foreground" href={withLocalePath(locale, "/models")}>
              {t("footer.links.models")}
            </Link>
            <Link className="block hover:text-foreground" href={withLocalePath(locale, "/book-test-drive")}>
              {t("footer.links.bookTestDrive")}
            </Link>
            <Link className="block hover:text-foreground" href={withLocalePath(locale, "/about")}>
              {t("footer.links.about")}
            </Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold">{t("footer.contact")}</h4>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>{t("footer.contact.email")}</p>
            <p>{t("footer.contact.phone")}</p>
            <p>{t("footer.contact.address")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
