import Link from "next/link";

import { Container } from "@/components/layout/container";
import { brand } from "@/lib/brand";
import { footerNavigation } from "@/lib/navigation";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <Container className="py-8 sm:py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="font-heading text-base font-semibold">
              {brand.name}{" "}
              <span lang="am" className="text-brand-amharic text-primary">
                {brand.nameAmharic}
              </span>
            </p>
            <p className="text-body-sm text-muted-foreground">{brand.tagline}</p>
          </div>
          <nav aria-label="Footer">
            <p className="text-sm font-semibold text-foreground">Explore</p>
            <ul className="mt-3 space-y-2">
              {footerNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-semibold text-foreground">About</p>
            <p className="text-body-sm text-muted-foreground">
              {brand.description}
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-caption">
          <p>
            © {year} {brand.name}{" "}
            <span lang="am" className="text-brand-amharic">
              {brand.nameAmharic}
            </span>
            . Celebrating culture across America.
          </p>
          <p className="mt-1">{brand.attribution}</p>
        </div>
      </Container>
    </footer>
  );
}
