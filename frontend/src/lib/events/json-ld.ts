import { format, parseISO } from "date-fns";

import { resolveMediaUrl } from "@/lib/api/media-url";
import { formatEventAddress } from "@/lib/events/address";
import { buildEventCanonicalPath } from "@/lib/events/slug";
import { brand } from "@/lib/brand";
import type { ListingResponse } from "@/types/api";

export type EventJsonLd = {
  "@context": "https://schema.org";
  "@type": "Event";
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  eventStatus?: "https://schema.org/EventScheduled" | "https://schema.org/EventCancelled";
  eventAttendanceMode: "https://schema.org/offlineAttendance";
  location?: {
    "@type": "Place";
    name?: string;
    address: {
      "@type": "PostalAddress";
      addressLocality: string;
      addressRegion: string;
      addressCountry: "US";
    };
  };
  image?: string[];
  url?: string;
  organizer?: {
    "@type": "Organization";
    name: string;
    email?: string;
  };
};

function combineDateAndTime(date: string, time: string | null | undefined): string | undefined {
  if (!time) {
    return date;
  }

  try {
    const [hours, minutes] = time.split(":").map(Number);
    const parsed = parseISO(date);
    parsed.setHours(hours, minutes ?? 0, 0, 0);
    return parsed.toISOString();
  } catch {
    return date;
  }
}

export function buildEventJsonLd(options: {
  event: ListingResponse;
  apiBaseUrl: string;
  siteUrl: string;
  isExpired: boolean;
}): EventJsonLd {
  const { event, apiBaseUrl, siteUrl, isExpired } = options;
  const address = formatEventAddress(event);
  const imageUrl = resolveMediaUrl(event.image_url, apiBaseUrl);
  const canonicalUrl = new URL(
    buildEventCanonicalPath(event.id),
    siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`,
  ).toString();

  const jsonLd: EventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    eventAttendanceMode: "https://schema.org/offlineAttendance",
    url: canonicalUrl,
  };

  if (event.event_date) {
    jsonLd.startDate = combineDateAndTime(event.event_date, event.start_time);
    jsonLd.endDate = combineDateAndTime(
      event.event_date,
      event.end_time ?? event.start_time,
    );
  }

  if (!isExpired && event.status === "approved") {
    jsonLd.eventStatus = "https://schema.org/EventScheduled";
  }

  if (address.lines.length > 0) {
    jsonLd.location = {
      "@type": "Place",
      name: event.venue ?? undefined,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city,
        addressRegion: event.state,
        addressCountry: "US",
      },
    };
  }

  if (imageUrl) {
    jsonLd.image = [imageUrl];
  }

  if (event.contact_email) {
    jsonLd.organizer = {
      "@type": "Organization",
      name: brand.name,
      email: event.contact_email,
    };
  }

  return jsonLd;
}

export function serializeEventJsonLd(jsonLd: EventJsonLd): string {
  return JSON.stringify(jsonLd);
}

export function buildEventMetadataDescription(event: ListingResponse): string {
  const dateLabel = event.event_date
    ? format(parseISO(event.event_date), "MMMM d, yyyy")
    : "Date TBA";

  return `${event.title} on ${dateLabel} in ${event.city}, ${event.state}. ${event.description}`.slice(
    0,
    160,
  );
}
