import { ListingCard as DirectoryListingCard } from "@/components/directory/listing-card";
import { getDirectorySectionByCategory } from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";

type ListingCardProps = {
  listing: ListingResponse;
  apiBaseUrl: string;
  href?: string;
};

/** Backward-compatible wrapper around the shared directory ListingCard. */
export function ListingCard({ listing, apiBaseUrl, href }: ListingCardProps) {
  const section = getDirectorySectionByCategory(listing.category);

  if (!section) {
    return null;
  }

  return (
    <DirectoryListingCard
      listing={listing}
      apiBaseUrl={apiBaseUrl}
      section={section}
      href={href}
    />
  );
}

export { ListingCard as DirectoryListingCard } from "@/components/directory/listing-card";
