import type { ListingResponse } from "@/types/api";
import { EVENTS_PAGE_SIZE } from "@/lib/events/constants";
import { parseISO, startOfDay } from "date-fns";

export type PaginationResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number = EVENTS_PAGE_SIZE,
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

export function extractCities(events: ListingResponse[]): string[] {
  const cities = new Set<string>();

  for (const event of events) {
    if (event.city) {
      cities.add(event.city);
    }
  }

  return [...cities].sort((left, right) => left.localeCompare(right));
}

export type EventFilters = {
  state?: string;
  city?: string;
  date?: string;
  page: number;
};

export function parseEventFilters(
  searchParams: Record<string, string | string[] | undefined>,
): EventFilters {
  const read = (key: string) => {
    const value = searchParams[key];
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  };

  const pageValue = Number.parseInt(read("page") ?? "1", 10);

  return {
    state: read("state")?.trim() || undefined,
    city: read("city")?.trim() || undefined,
    date: read("date")?.trim() || undefined,
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
  };
}

export function applyEventFilters(
  events: ListingResponse[],
  filters: Pick<EventFilters, "city" | "date">,
): ListingResponse[] {
  return events.filter((event) => {
    if (filters.city && event.city !== filters.city) {
      return false;
    }

    if (filters.date && event.event_date !== filters.date) {
      return false;
    }

    return true;
  });
}

export function filterCurrentAndFutureEvents(
  events: ListingResponse[],
  reference: Date = new Date(),
): ListingResponse[] {
  const today = startOfDay(reference);

  return events.filter((event) => {
    if (!event.event_date) {
      return true;
    }

    try {
      return startOfDay(parseISO(event.event_date)) >= today;
    } catch {
      return true;
    }
  });
}

export function buildEventSearchParams(
  filters: EventFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.state) {
    params.set("state", filters.state);
  }
  if (filters.city) {
    params.set("city", filters.city);
  }
  if (filters.date) {
    params.set("date", filters.date);
  }
  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  return params;
}

export function filtersToQueryString(filters: EventFilters): string {
  const params = buildEventSearchParams(filters);
  const query = params.toString();
  return query ? `?${query}` : "";
}
