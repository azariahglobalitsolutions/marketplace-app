import type { ListingResponse } from "@/types/api";
import { DIRECTORY_PAGE_SIZE } from "@/lib/directory/constants";
import type { DirectoryFilterSupport } from "@/lib/directory/sections";

export type PaginationResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type DirectoryFilters = {
  state?: string;
  city?: string;
  page: number;
};

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number = DIRECTORY_PAGE_SIZE,
): PaginationResult<T> {
  const safePageSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    page: safePage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
  };
}

export function extractCities(listings: ListingResponse[]): string[] {
  const cities = new Set<string>();

  for (const listing of listings) {
    if (listing.city) {
      cities.add(listing.city);
    }
  }

  return [...cities].sort((left, right) => left.localeCompare(right));
}

export function sanitizeDirectoryFilters(
  filters: DirectoryFilters,
  support: DirectoryFilterSupport,
): DirectoryFilters {
  return {
    state: support.state ? filters.state : undefined,
    city: support.city ? filters.city : undefined,
    page: support.pagination ? filters.page : 1,
  };
}

export function parseDirectoryFilters(
  searchParams: Record<string, string | string[] | undefined>,
  support?: DirectoryFilterSupport,
): DirectoryFilters {
  const read = (key: string) => {
    const value = searchParams[key];
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  };

  const pageValue = Number.parseInt(read("page") ?? "1", 10);

  const filters: DirectoryFilters = {
    state: read("state")?.trim() || undefined,
    city: read("city")?.trim() || undefined,
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
  };

  return support ? sanitizeDirectoryFilters(filters, support) : filters;
}

export function applyDirectoryFilters(
  listings: ListingResponse[],
  filters: Pick<DirectoryFilters, "city">,
): ListingResponse[] {
  if (!filters.city) {
    return listings;
  }

  return listings.filter((listing) => listing.city === filters.city);
}

export function buildDirectorySearchParams(
  filters: DirectoryFilters,
  support?: DirectoryFilterSupport,
): URLSearchParams {
  const sanitized = support
    ? sanitizeDirectoryFilters(filters, support)
    : filters;
  const params = new URLSearchParams();

  if (sanitized.state) {
    params.set("state", sanitized.state);
  }
  if (sanitized.city) {
    params.set("city", sanitized.city);
  }
  if (sanitized.page > 1) {
    params.set("page", String(sanitized.page));
  }

  return params;
}

export function filtersToQueryString(
  filters: DirectoryFilters,
  support?: DirectoryFilterSupport,
): string {
  const query = buildDirectorySearchParams(filters, support).toString();
  return query ? `?${query}` : "";
}

export function countActiveDirectoryFilters(
  filters: DirectoryFilters,
  support?: DirectoryFilterSupport,
): number {
  const sanitized = support
    ? sanitizeDirectoryFilters(filters, support)
    : filters;

  return [sanitized.state, sanitized.city].filter(Boolean).length;
}
