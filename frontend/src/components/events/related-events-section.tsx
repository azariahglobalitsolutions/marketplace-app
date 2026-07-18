import { EventListCard } from "@/components/events/event-list-card";
import { SectionHeading } from "@/components/layout/section-heading";
import { ErrorState } from "@/components/patterns/error-state";
import type { ListingResponse } from "@/types/api";

type RelatedEventsSectionProps = {
  events: ListingResponse[];
  apiBaseUrl: string;
  error?: string;
};

export function RelatedEventsSection({
  events,
  apiBaseUrl,
  error,
}: RelatedEventsSectionProps) {
  return (
    <section aria-labelledby="related-events-heading" className="space-y-4">
      <SectionHeading
        as="h2"
        id="related-events-heading"
        title="Related events"
        description="More approved events in the same state from the live API."
        className="mb-0"
      />

      {error ? (
        <ErrorState message={error} title="Could not load related events" />
      ) : null}

      {!error && events.length === 0 ? (
        <p className="text-body-sm text-muted-foreground">
          No other approved events are available in this state right now.
        </p>
      ) : null}

      {events.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <li key={event.id}>
              <EventListCard event={event} apiBaseUrl={apiBaseUrl} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
