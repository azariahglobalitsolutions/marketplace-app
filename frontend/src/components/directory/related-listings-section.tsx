import { ListingCard } from "@/components/directory/listing-card";
import { SectionHeading } from "@/components/layout/section-heading";
import { ErrorState } from "@/components/patterns/error-state";
import type { DirectorySectionConfig } from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";

type RelatedListingsSectionProps = {
  section: DirectorySectionConfig;
  listings: ListingResponse[];
  apiBaseUrl: string;
  error?: string;
};

export function RelatedListingsSection({
  section,
  listings,
  apiBaseUrl,
  error,
}: RelatedListingsSectionProps) {
  return (
    <section aria-labelledby="related-listings-heading" className="space-y-4">
      <SectionHeading
        as="h2"
        id="related-listings-heading"
        title={`Related ${section.shortTitle.toLowerCase()}`}
        description={`More approved listings in the same state from the live API.`}
        className="mb-0"
      />

      {error ? (
        <ErrorState
          message={error}
          title="Could not load related listings"
        />
      ) : null}

      {!error && listings.length === 0 ? (
        <p className="text-body-sm text-muted-foreground">
          No other approved listings are available in this state right now.
        </p>
      ) : null}

      {listings.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <li key={listing.id}>
              <ListingCard
                listing={listing}
                apiBaseUrl={apiBaseUrl}
                section={section}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
