import { EmptyState } from "@/components/patterns/empty-state";
import type { DirectorySectionConfig } from "@/lib/directory/sections";

type ListingEmptyStateProps = {
  section: DirectorySectionConfig;
  hasActiveFilters?: boolean;
};

export function ListingEmptyState({
  section,
  hasActiveFilters = false,
}: ListingEmptyStateProps) {
  return (
    <EmptyState
      title={section.emptyTitle}
      description={
        hasActiveFilters
          ? `${section.emptyDescription} Try adjusting your filters or browse another state.`
          : section.emptyDescription
      }
      actionLabel={section.addListingLabel}
      actionHref="/listings/new"
    />
  );
}
