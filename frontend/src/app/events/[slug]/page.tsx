import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventDetailView } from "@/components/events/event-detail-view";
import { PageContainer } from "@/components/layout/page-container";
import { resolveMediaUrl } from "@/lib/api/media-url";
import { getSiteUrl } from "@/lib/config/site";
import { isExpiredEvent } from "@/lib/events/event-status";
import { getEventDetailData } from "@/lib/events/cached-event-detail";
import {
  buildEventJsonLd,
  buildEventMetadataDescription,
  serializeEventJsonLd,
} from "@/lib/events/json-ld";
import {
  buildEventCanonicalPath,
  parseEventSlug,
} from "@/lib/events/slug";
import { brand } from "@/lib/brand";

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listingId = parseEventSlug(slug);

  if (!listingId) {
    return {
      title: "Event not found",
    };
  }

  const data = await getEventDetailData(listingId);
  if (data.notFound) {
    return {
      title: "Event not found",
    };
  }

  const { event, apiBaseUrl } = data;
  const canonicalPath = buildEventCanonicalPath(event.id);
  const description = buildEventMetadataDescription(event);
  const imageUrl = resolveMediaUrl(event.image_url, apiBaseUrl);

  return {
    title: event.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${event.title} | ${brand.name}`,
      description,
      type: "website",
      url: canonicalPath,
      images: imageUrl ? [{ url: imageUrl, alt: `${event.title} flyer` }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: event.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export const revalidate = 60;

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const listingId = parseEventSlug(slug);

  if (!listingId) {
    notFound();
  }

  const data = await getEventDetailData(listingId);

  if (data.notFound) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const jsonLd = buildEventJsonLd({
    event: data.event,
    apiBaseUrl: data.apiBaseUrl,
    siteUrl,
    isExpired: isExpiredEvent(data.event.event_date),
  });

  return (
    <PageContainer
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Events & Activities", href: "/events" },
        { label: data.event.title },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeEventJsonLd(jsonLd) }}
      />
      <EventDetailView
        event={data.event}
        relatedEvents={data.relatedEvents}
        apiBaseUrl={data.apiBaseUrl}
        siteUrl={siteUrl}
        relatedError={data.error}
      />
    </PageContainer>
  );
}
