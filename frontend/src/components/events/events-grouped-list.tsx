import { EventListCard } from "@/components/events/event-list-card";
import { EVENT_TIME_GROUPS } from "@/lib/events/constants";
import type { GroupedEvents } from "@/lib/events/grouping";
import type { ListingResponse } from "@/types/api";

type EventsGroupedListProps = {
  groups: GroupedEvents;
  apiBaseUrl: string;
};

export function EventsGroupedList({
  groups,
  apiBaseUrl,
}: EventsGroupedListProps) {
  const hasEvents = EVENT_TIME_GROUPS.some(
    ({ key }) => groups[key].length > 0,
  );

  if (!hasEvents) {
    return null;
  }

  return (
    <div className="space-y-10">
      {EVENT_TIME_GROUPS.map(({ key, label }) => {
        const events = groups[key];
        if (events.length === 0) {
          return null;
        }

        return (
          <section key={key} aria-labelledby={`events-group-${key}`}>
            <h2 id={`events-group-${key}`} className="text-h2 mb-4">
              {label}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event: ListingResponse) => (
                <li key={event.id}>
                  <EventListCard event={event} apiBaseUrl={apiBaseUrl} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
