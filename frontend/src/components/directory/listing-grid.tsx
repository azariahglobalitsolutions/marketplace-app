import { ListingCard } from "@/components/directory/listing-card";
import { ListingGridSkeleton } from "@/components/patterns/loading-skeleton";
import type { DirectorySectionConfig } from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";
import { cn } from "@/lib/utils";

type ListingGridProps = {
  listings: ListingResponse[];
  apiBaseUrl: string;
  section: DirectorySectionConfig;
  isLoading?: boolean;
  className?: string;
};

export function ListingGrid({
  listings,
  apiBaseUrl,
  section,
  isLoading = false,
  className,
}: ListingGridProps) {
  if (isLoading) {
    return <ListingGridSkeleton className={className} count={6} />;
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <ul
      className={cn(
        "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
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
  );
}
