import {
  applyDirectoryFilters,
  extractCities,
  paginateItems,
  type DirectoryFilters,
} from "@/lib/directory/filters";
import type { DirectoryFilterSupport } from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";

export type ProcessedDirectoryPage = {
  listings: ListingResponse[];
  pagination: ReturnType<typeof paginateItems<ListingResponse>>;
  cities: string[];
};

export function processDirectoryPage(
  listings: ListingResponse[],
  filters: DirectoryFilters,
  support?: DirectoryFilterSupport,
): ProcessedDirectoryPage {
  const filtered = support?.city
    ? applyDirectoryFilters(listings, filters)
    : listings;

  const pagination = support?.pagination
    ? paginateItems(filtered, filters.page)
    : {
        items: filtered,
        page: 1,
        pageSize: filtered.length || 1,
        totalItems: filtered.length,
        totalPages: 1,
      };

  return {
    listings: pagination.items,
    pagination,
    cities: extractCities(listings),
  };
}
