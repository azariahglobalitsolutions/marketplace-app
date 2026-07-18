import Link from "next/link";
import { CalendarDays, CalendarPlus, PlusCircle, Store } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Explore Events",
    href: "/events",
    icon: CalendarDays,
    variant: "default" as const,
  },
  {
    label: "Find Businesses",
    href: "/restaurants",
    icon: Store,
    variant: "secondary" as const,
  },
  {
    label: "Add a Listing",
    href: "/listings/new",
    icon: PlusCircle,
    variant: "outline" as const,
  },
  {
    label: "Submit an Event",
    href: "/events/new",
    icon: CalendarPlus,
    variant: "outline" as const,
  },
];

export function HomeHeroSection() {
  return (
    <Section className="border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_8%,transparent),transparent)] pb-10 pt-4 sm:pb-14 sm:pt-8">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-caption mb-3 font-medium uppercase tracking-[0.2em] text-primary">
            {brand.name}{" "}
            <span lang="am" className="text-brand-amharic">
              {brand.nameAmharic}
            </span>
          </p>
          <h1 className="text-display text-balance">
            Discover Habesha Events, Businesses, and Community Resources Across
            the USA
          </h1>
          <p className="text-body-sm mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-base">
            Find Ethiopian and Eritrean events, restaurants, health providers,
            educational programs, and community organizations near you.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    buttonVariants({ variant: action.variant, size: "lg" }),
                    "h-auto min-h-11 w-full py-3",
                  )}
                >
                  <Icon aria-hidden />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
