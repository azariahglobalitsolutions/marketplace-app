import {
  applyDirectoryFilters,
  extractCities,
  paginateItems,
  type DirectoryFilters,
} from "@/lib/directory/filters";
import type { ListingResponse } from "@/types/api";

export type ProcessedDirectoryPage = {
  listings: ListingResponse[];
  pagination: ReturnType<typeof paginateItems<ListingResponse>>;
  cities: string[];
};

export function processDirectoryPage(
  listings: ListingResponse[],
  filters: DirectoryFilters,
): ProcessedDirectoryPage {
  const filtered = applyDirectoryFilters(listings, filters);
  const pagination = paginateItems(filtered, filters.page);

  return {
    listings: pagination.items,
    pagination,
    cities: extractCities(listings),
  };
}
