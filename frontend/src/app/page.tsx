import type { Metadata } from "next";
import { Suspense } from "react";

import { CategoryGridSection } from "@/components/home/category-grid-section";
import { CommunityCtaSection } from "@/components/home/community-cta-section";
import { ExploreRegionsSection } from "@/components/home/explore-regions-section";
import { FeaturedListingsSection } from "@/components/home/featured-listings-section";
import { HomeHeroSection } from "@/components/home/home-hero-section";
import { HomeSearchSection } from "@/components/home/home-search-section";
import { UpcomingEventsSection } from "@/components/home/upcoming-events-section";
import { EventListSkeleton } from "@/components/layout/event-card-skeleton";
import { ListingGridSkeleton } from "@/components/patterns/loading-skeleton";
import { brand } from "@/lib/brand";
import { getHomepageData } from "@/lib/home/get-homepage-data";

export const metadata: Metadata = {
  title: "Discover Habesha Events, Businesses, and Community Resources",
  description:
    "Find Ethiopian and Eritrean events, restaurants, health providers, educational programs, and community organizations across the United States.",
  openGraph: {
    title: `Discover Habesha Events & Community Resources | ${brand.name}`,
    description:
      "Find Ethiopian and Eritrean events, restaurants, health providers, educational programs, and community organizations near you.",
    type: "website",
    locale: "en_US",
    siteName: brand.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `Discover Habesha Events & Community Resources | ${brand.name}`,
    description:
      "Find Ethiopian and Eritrean events, restaurants, health providers, educational programs, and community organizations near you.",
  },
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 60;

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
    state?: string;
  }>;
};

async function HomeContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string }>;
}) {
  const params = await searchParams;
  const data = await getHomepageData({
    keyword: params.q,
    state: params.state,
  });

  return (
    <>
      <HomeSearchSection
        states={data.states}
        initialKeyword={params.q ?? ""}
        initialState={params.state ?? ""}
      />
      <UpcomingEventsSection
        events={data.events}
        apiBaseUrl={data.apiBaseUrl}
        error={data.errors.events}
        selectedState={params.state}
      />
      <CategoryGridSection
        categories={data.categories}
        error={data.errors.categories}
      />
      <FeaturedListingsSection
        listings={data.featuredListings}
        apiBaseUrl={data.apiBaseUrl}
        error={data.errors.featured}
      />
      <ExploreRegionsSection />
      <CommunityCtaSection />
    </>
  );
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <>
      <HomeHeroSection />
      <Suspense
        fallback={
          <>
            <div className="py-8">
              <div className="mx-auto max-w-(--container-max) px-(--container-padding)">
                <div className="mb-6 h-8 w-64 animate-pulse rounded bg-muted" />
                <div className="h-32 animate-pulse rounded-2xl bg-muted" />
              </div>
            </div>
            <div className="bg-muted/20 py-8">
              <div className="mx-auto max-w-(--container-max) px-(--container-padding)">
                <EventListSkeleton count={3} />
              </div>
            </div>
            <div className="py-8">
              <div className="mx-auto max-w-(--container-max) px-(--container-padding)">
                <ListingGridSkeleton count={6} />
              </div>
            </div>
          </>
        }
      >
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}
