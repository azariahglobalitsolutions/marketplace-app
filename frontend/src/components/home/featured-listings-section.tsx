import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingGridSkeleton } from "@/components/patterns/loading-skeleton";
import { EmptyState } from "@/components/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import { buttonVariants } from "@/components/ui/button";
import type { ListingResponse } from "@/types/api";
import { cn } from "@/lib/utils";

type FeaturedListingsSectionProps = {
  listings: ListingResponse[];
  apiBaseUrl: string;
  error?: string;
  isLoading?: boolean;
  className?: string;
};

export function FeaturedListingsSection({
  listings,
  apiBaseUrl,
  error,
  isLoading = false,
  className,
}: FeaturedListingsSectionProps) {
  return (
    <Section
      className={cn("bg-muted/20", className)}
      aria-labelledby="featured-listings-heading"
    >
      <Container>
        <SectionHeading
          id="featured-listings-heading"
          as="h2"
          title="Featured listings"
          description="A rotating sample of approved listings from restaurants, health, education, and community categories — loaded from the API."
          action={
            <Link
              href="/restaurants"
              className={buttonVariants({ variant: "soft" })}
            >
              Browse businesses
              <ArrowRight aria-hidden />
            </Link>
          }
        />

        {isLoading ? <ListingGridSkeleton count={6} /> : null}

        {!isLoading && error && listings.length === 0 ? (
          <ErrorState message={error} title="Could not load featured listings" />
        ) : null}

        {!isLoading && !error && listings.length === 0 ? (
          <EmptyState
            title="No featured listings yet"
            description="Approved listings will appear here once organizers submit restaurants, health providers, education programs, or community groups."
            actionLabel="Add a listing"
            actionHref="/listings/new"
          />
        ) : null}

        {!isLoading && listings.length > 0 ? (
          <>
            {error ? (
              <p className="text-caption mb-4 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2">
                {error}
              </p>
            ) : null}
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <li key={listing.id}>
                  <ListingCard listing={listing} apiBaseUrl={apiBaseUrl} />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Container>
    </Section>
  );
}
