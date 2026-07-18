import Link from "next/link";
import {
  CalendarDays,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Ticket,
} from "lucide-react";

import { EventCalendarButton } from "@/components/events/event-calendar-button";
import { EventExpiredNotice } from "@/components/events/event-expired-notice";
import { EventShareButton } from "@/components/events/event-share-button";
import { RelatedEventsSection } from "@/components/events/related-events-section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { OptimizedImage } from "@/components/media/optimized-image";
import { resolveMediaUrl } from "@/lib/api/media-url";
import { formatEventAddress } from "@/lib/events/address";
import { isExpiredEvent } from "@/lib/events/event-status";
import { buildEventCanonicalPath } from "@/lib/events/slug";
import { formatListingDate, formatListingTime } from "@/lib/home/format";
import type { ListingResponse } from "@/types/api";

type EventDetailViewProps = {
  event: ListingResponse;
  relatedEvents: ListingResponse[];
  apiBaseUrl: string;
  siteUrl: string;
  relatedError?: string;
};

function MissingField({ label }: { label: string }) {
  return (
    <p className="text-body-sm text-muted-foreground">
      {label} was not provided by the organizer.
    </p>
  );
}

export function EventDetailView({
  event,
  relatedEvents,
  apiBaseUrl,
  siteUrl,
  relatedError,
}: EventDetailViewProps) {
  const flyerUrl = resolveMediaUrl(event.image_url, apiBaseUrl);
  const address = formatEventAddress(event);
  const startTime = formatListingTime(event.start_time);
  const endTime = formatListingTime(event.end_time);
  const expired = isExpiredEvent(event.event_date);
  const shareUrl = new URL(
    buildEventCanonicalPath(event.id),
    siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`,
  ).toString();
  const hasTicketLink = false;

  return (
    <article className="space-y-10">
      {expired ? <EventExpiredNotice eventDate={event.event_date} /> : null}

      <header className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Habesha Events</Badge>
          {event.status !== "approved" ? (
            <Badge variant="outline">{event.status}</Badge>
          ) : null}
        </div>
        <h1 className="text-display">{event.title}</h1>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden />
            {formatListingDate(event.event_date)}
          </span>
          {startTime ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {startTime}
              {endTime ? ` – ${endTime}` : ""}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              Time not provided
            </span>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-8">
          <section aria-labelledby="event-flyer-heading">
            <h2 id="event-flyer-heading" className="sr-only">
              Event flyer
            </h2>
            {flyerUrl ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                <OptimizedImage
                  src={flyerUrl}
                  alt={`${event.title} flyer`}
                  width={1200}
                  height={900}
                  className="max-h-[36rem] w-full object-contain"
                />
              </div>
            ) : (
              <MissingField label="A flyer image" />
            )}
          </section>

          <section aria-labelledby="event-description-heading" className="space-y-3">
            <h2 id="event-description-heading" className="text-h2">
              About this event
            </h2>
            <p className="text-body whitespace-pre-wrap">{event.description}</p>
          </section>

          <RelatedEventsSection
            events={relatedEvents}
            apiBaseUrl={apiBaseUrl}
            error={relatedError}
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section
            aria-labelledby="event-location-heading"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <h2 id="event-location-heading" className="text-h3 mb-4">
              Location
            </h2>
            <div className="space-y-3 text-sm">
              {event.venue ? (
                <p className="inline-flex items-start gap-2 font-medium text-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {event.venue}
                </p>
              ) : (
                <MissingField label="A venue" />
              )}
              {address.lines.length > 0 ? (
                <p className="text-muted-foreground">{address.singleLine}</p>
              ) : null}
              <p className="text-caption text-muted-foreground">
                Street address is not included in the current listing API
                response.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="event-organizer-heading"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <h2 id="event-organizer-heading" className="text-h3 mb-4">
              Organizer contact
            </h2>
            {event.contact_email || event.contact_phone ? (
              <div className="space-y-2 text-sm">
                {event.contact_email ? (
                  <a
                    href={`mailto:${event.contact_email}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="size-4" aria-hidden />
                    {event.contact_email}
                  </a>
                ) : null}
                {event.contact_phone ? (
                  <a
                    href={`tel:${event.contact_phone_tel ?? event.contact_phone}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="size-4" aria-hidden />
                    {event.contact_phone}
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <MissingField label="Organizer contact information" />
                <Link href="/login" className={buttonVariants({ variant: "soft", size: "sm" })}>
                  Sign in to view contact details
                </Link>
              </div>
            )}
          </section>

          <section
            aria-labelledby="event-ticket-heading"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <h2 id="event-ticket-heading" className="text-h3 mb-4">
              Tickets
            </h2>
            {hasTicketLink ? null : (
              <>
                <MissingField label="A ticket link" />
                {event.attachment_url ? (
                  <a
                    href={resolveMediaUrl(event.attachment_url, apiBaseUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="size-4" aria-hidden />
                    View organizer attachment
                    {event.attachment_name ? ` (${event.attachment_name})` : ""}
                  </a>
                ) : null}
              </>
            )}
            <p className="text-caption mt-3 inline-flex items-center gap-1 text-muted-foreground">
              <Ticket className="size-3.5" aria-hidden />
              Ticket pricing fields are not available in the backend API.
            </p>
          </section>

          <section
            aria-labelledby="event-actions-heading"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <h2 id="event-actions-heading" className="text-h3 mb-4">
              Actions
            </h2>
            <div className="flex flex-col gap-3">
              <EventCalendarButton event={event} />
              <EventShareButton title={event.title} url={shareUrl} />
            </div>
          </section>
        </aside>
      </div>
    </article>
  );
}
