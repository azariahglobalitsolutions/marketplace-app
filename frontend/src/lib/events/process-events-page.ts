import {
  applyEventFilters,
  extractCities,
  filterCurrentAndFutureEvents,
  paginateItems,
  type EventFilters,
} from "@/lib/events/filters";
import {
  flattenGroupedEvents,
  groupEventsByTimeframe,
  type GroupedEvents,
} from "@/lib/events/grouping";
import type { ListingResponse } from "@/types/api";
import type { PaginationResult } from "@/lib/events/filters";

export type ProcessedEventsPage = {
  displayGroups: GroupedEvents;
  pagination: PaginationResult<ListingResponse>;
  filteredEvents: ListingResponse[];
  cities: string[];
};

export function processEventsForPage(
  events: ListingResponse[],
  filters: EventFilters,
  reference: Date = new Date(),
): ProcessedEventsPage {
  const filteredEvents = filterCurrentAndFutureEvents(
    applyEventFilters(events, filters),
    reference,
  );
  const grouped = groupEventsByTimeframe(filteredEvents, reference);
  const ordered = flattenGroupedEvents(grouped);
  const pagination = paginateItems(ordered, filters.page);
  const displayGroups = groupEventsByTimeframe(pagination.items, reference);

  return {
    displayGroups,
    pagination,
    filteredEvents,
    cities: extractCities(events),
  };
}
