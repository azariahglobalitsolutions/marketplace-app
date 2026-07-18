import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { EventCard } from "@/components/listings/event-card";
import { EmptyState } from "@/components/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import { EventListSkeleton } from "@/components/layout/event-card-skeleton";
import { buttonVariants } from "@/components/ui/button";
import type { ListingResponse } from "@/types/api";
import { cn } from "@/lib/utils";

type UpcomingEventsSectionProps = {
  events: ListingResponse[];
  apiBaseUrl: string;
  error?: string;
  isLoading?: boolean;
  selectedState?: string;
  className?: string;
};

export function UpcomingEventsSection({
  events,
  apiBaseUrl,
  error,
  isLoading = false,
  selectedState,
  className,
}: UpcomingEventsSectionProps) {
  return (
    <Section
      id="upcoming-events"
      className={cn("bg-muted/20", className)}
      aria-labelledby="upcoming-events-heading"
    >
      <Container>
        <SectionHeading
          id="upcoming-events-heading"
          as="h2"
          title="Upcoming Habesha events"
          description={
            selectedState
              ? `Approved events in ${selectedState} from the Wube Bereha API.`
              : "Approved events from the Wube Bereha API, sorted by date."
          }
          action={
            <Link href="/events" className={buttonVariants({ variant: "soft" })}>
              View all events
              <ArrowRight aria-hidden />
            </Link>
          }
        />

        {isLoading ? <EventListSkeleton count={4} /> : null}

        {!isLoading && error ? (
          <ErrorState message={error} title="Could not load events" />
        ) : null}

        {!isLoading && !error && events.length === 0 ? (
          <EmptyState
            title="No upcoming events yet"
            description={
              selectedState
                ? `There are no approved events in ${selectedState} right now. Try another state or check back soon.`
                : "There are no approved events to show right now. Check back soon or submit one for your community."
            }
            actionLabel="Submit an event"
            actionHref="/submit-event"
          />
        ) : null}

        {!isLoading && !error && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} apiBaseUrl={apiBaseUrl} />
            ))}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
