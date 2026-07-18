import type { Metadata } from "next";
import { Suspense } from "react";

import { EventsPageView, EventsPageViewSkeleton } from "@/components/events/events-page-view";
import { PageContainer } from "@/components/layout/page-container";
import { brand } from "@/lib/brand";
import { parseEventFilters } from "@/lib/events/filters";
import { getEventsPageData } from "@/lib/events/get-events-page-data";

type EventsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: EventsPageProps): Promise<Metadata> {
  const filters = parseEventFilters(await searchParams);
  const locationSuffix = filters.state ? ` in ${filters.state}` : "";

  return {
    title: `Habesha Events & Activities${locationSuffix}`,
    description: `Discover Ethiopian and Eritrean events${locationSuffix}. Browse cultural gatherings, concerts, and community activities on ${brand.name}.`,
    openGraph: {
      title: `Habesha Events & Activities${locationSuffix} | ${brand.name}`,
      description: `Discover Ethiopian and Eritrean events${locationSuffix} across the United States.`,
      type: "website",
    },
    alternates: {
      canonical: "/events",
    },
  };
}

export const revalidate = 60;

async function EventsPageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseEventFilters(await searchParams);
  const data = await getEventsPageData(filters.state);

  return (
    <EventsPageView
      events={data.events}
      states={data.states}
      apiBaseUrl={data.apiBaseUrl}
      filters={filters}
      error={data.error}
    />
  );
}

export default function EventsPage({ searchParams }: EventsPageProps) {
  return (
    <PageContainer
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Events & Activities" },
      ]}
    >
      <Suspense fallback={<EventsPageViewSkeleton />}>
        <EventsPageContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
