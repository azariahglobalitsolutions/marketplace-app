import Link from "next/link";
import { Megaphone, Users } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CommunityCtaSectionProps = {
  className?: string;
};

export function CommunityCtaSection({ className }: CommunityCtaSectionProps) {
  return (
    <Section
      className={cn("border-t border-border/60 pb-12 sm:pb-16", className)}
      aria-labelledby="community-cta-heading"
    >
      <Container>
        <div className="grid gap-6 rounded-3xl border border-border bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_10%,var(--card)),var(--card))] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div className="space-y-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" aria-hidden />
            </div>
            <h2 id="community-cta-heading" className="text-h2">
              Share your event or business with the community
            </h2>
            <p className="text-body-sm max-w-2xl text-muted-foreground">
              Listings are reviewed by the Wube Bereha team before they appear
              publicly. Help neighbors discover authentic Habesha events,
              restaurants, and services across the United States.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-stretch">
            <Link
              href="/add-listing"
              className={buttonVariants({ size: "lg" })}
            >
              Add a listing
            </Link>
            <Link
              href="/advertise"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <Megaphone aria-hidden />
              Advertise with us
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
