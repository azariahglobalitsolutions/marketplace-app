import {
  addDays,
  endOfWeek,
  isSameDay,
  isSaturday,
  isSunday,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";

import type { EventTimeGroup } from "@/lib/events/constants";
import type { ListingResponse } from "@/types/api";

export type GroupedEvents = Record<EventTimeGroup, ListingResponse[]>;

function parseEventDate(event: ListingResponse): Date | null {
  if (!event.event_date) {
    return null;
  }

  try {
    const parsed = parseISO(event.event_date);
    return startOfDay(parsed);
  } catch {
    return null;
  }
}

export function classifyEventDate(
  eventDate: Date | null,
  reference: Date,
): EventTimeGroup {
  if (!eventDate) {
    return "upcoming";
  }

  const today = startOfDay(reference);
  const tomorrow = addDays(today, 1);
  const weekStart = startOfWeek(reference, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(reference, { weekStartsOn: 0 });

  if (isSameDay(eventDate, today)) {
    return "today";
  }

  if (isSameDay(eventDate, tomorrow)) {
    return "tomorrow";
  }

  const isWeekendDay = isSaturday(eventDate) || isSunday(eventDate);
  const inThisWeek = isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
  const isFutureOrToday = eventDate >= today;

  if (isWeekendDay && inThisWeek && isFutureOrToday) {
    return "this-weekend";
  }

  return "upcoming";
}

export function groupEventsByTimeframe(
  events: ListingResponse[],
  reference: Date = new Date(),
): GroupedEvents {
  const groups: GroupedEvents = {
    today: [],
    tomorrow: [],
    "this-weekend": [],
    upcoming: [],
  };

  for (const event of events) {
    const eventDate = parseEventDate(event);
    const bucket = classifyEventDate(eventDate, reference);
    groups[bucket].push(event);
  }

  const compare = (left: ListingResponse, right: ListingResponse) => {
    const leftDate = left.event_date ?? "9999-12-31";
    const rightDate = right.event_date ?? "9999-12-31";
    if (leftDate !== rightDate) {
      return leftDate.localeCompare(rightDate);
    }

    return (left.start_time ?? "").localeCompare(right.start_time ?? "");
  };

  for (const key of Object.keys(groups) as EventTimeGroup[]) {
    groups[key].sort(compare);
  }

  return groups;
}

export function flattenGroupedEvents(groups: GroupedEvents): ListingResponse[] {
  return [
    ...groups.today,
    ...groups.tomorrow,
    ...groups["this-weekend"],
    ...groups.upcoming,
  ];
}
