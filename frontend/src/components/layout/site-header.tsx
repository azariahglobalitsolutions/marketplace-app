import Link from "next/link";

import { Container } from "@/components/layout/container";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { GlobalSearchTrigger } from "@/components/layout/global-search-trigger";
import { LocationSelector } from "@/components/layout/location-selector";
import { Logo } from "@/components/layout/logo";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { buttonVariants } from "@/components/ui/button";
import { actionNavigation } from "@/lib/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Container>
        <div className="flex flex-col gap-3 py-3 lg:gap-0">
          <div className="flex items-center gap-3">
            <MobileNavigation />
            <Logo className="min-w-0 flex-1 lg:flex-none" />
            <div className="hidden flex-1 justify-center px-4 md:flex">
              <GlobalSearchTrigger />
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <LocationSelector />
              {actionNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={buttonVariants({ variant: "soft", size: "sm" })}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 md:hidden">
            <GlobalSearchTrigger />
            <LocationSelector />
          </div>
          <DesktopNavigation />
        </div>
      </Container>
    </header>
  );
}
