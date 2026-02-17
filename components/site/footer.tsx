import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 py-12">
      <div className="container-shell grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-display text-lg font-semibold">Astra Motors</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Contemporary vehicles with connected technology, efficient powertrains, and comfort-first interiors.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <Link className="block hover:text-foreground" href="/models">
              Models
            </Link>
            <Link className="block hover:text-foreground" href="/book-test-drive">
              Book Test Drive
            </Link>
            <Link className="block hover:text-foreground" href="/about">
              About
            </Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p>sales@astramotors.example</p>
            <p>+1 (555) 018-4040</p>
            <p>211 Harbor Avenue, Austin, TX</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
