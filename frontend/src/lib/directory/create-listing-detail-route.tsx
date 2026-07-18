import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingDetailView } from "@/components/directory/listing-detail-view";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState } from "@/components/patterns/error-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveMediaUrl } from "@/lib/api/media-url";
import { getCachedListingDetailData } from "@/lib/directory/cached-listing-detail";
import {
  buildListingJsonLd,
  buildListingMetadataDescription,
  serializeListingJsonLd,
} from "@/lib/directory/json-ld";
import {
  buildListingCanonicalPath,
  parseListingSlug,
} from "@/lib/directory/slug";
import type { DirectorySectionConfig } from "@/lib/directory/sections";
import { getSiteUrl } from "@/lib/config/site";
import { brand } from "@/lib/brand";

type ListingDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function createListingDetailMetadata(
  section: DirectorySectionConfig,
): (props: ListingDetailPageProps) => Promise<Metadata> {
  return async function generateListingDetailMetadata({ params }) {
    const { slug } = await params;
    const listingId = parseListingSlug(slug);

    if (!listingId) {
      return {
        title: "Listing not found",
      };
    }

    const data = await getCachedListingDetailData(section, listingId);
    if (("notFound" in data && data.notFound) || "serverError" in data) {
      return {
        title: "Listing not found",
      };
    }

    const { listing, apiBaseUrl } = data;
    const canonicalPath = buildListingCanonicalPath(section, listing.id);
    const description = buildListingMetadataDescription(listing);
    const imageUrl =
      resolveMediaUrl(listing.image_url, apiBaseUrl) ??
      resolveMediaUrl(listing.logo_url, apiBaseUrl);

    return {
      title: listing.title,
      description,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: `${listing.title} | ${brand.name}`,
        description,
        type: "website",
        url: canonicalPath,
        images: imageUrl
          ? [{ url: imageUrl, alt: `${listing.title} photo` }]
          : undefined,
      },
      twitter: {
        card: imageUrl ? "summary_large_image" : "summary",
        title: listing.title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  };
}

export function createListingDetailPage(section: DirectorySectionConfig) {
  return async function ListingDetailPage({ params }: ListingDetailPageProps) {
    const { slug } = await params;
    const listingId = parseListingSlug(slug);

    if (!listingId) {
      notFound();
    }

    const data = await getCachedListingDetailData(section, listingId);

    if ("notFound" in data && data.notFound) {
      notFound();
    }

    if ("serverError" in data) {
      return (
        <PageContainer
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: section.shortTitle, href: section.path },
            { label: "Error" },
          ]}
        >
          <ErrorState title="Unable to load listing" message={data.message} />
        </PageContainer>
      );
    }

    const siteUrl = getSiteUrl();
    const jsonLd = buildListingJsonLd({
      listing: data.listing,
      section,
      apiBaseUrl: data.apiBaseUrl,
      siteUrl,
    });

    return (
      <PageContainer
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: section.shortTitle, href: section.path },
          { label: data.listing.title },
        ]}
      >
        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: serializeListingJsonLd(jsonLd),
            }}
          />
        ) : null}
        <ListingDetailView
          listing={data.listing}
          section={section}
          relatedListings={data.relatedListings}
          apiBaseUrl={data.apiBaseUrl}
          relatedError={data.error}
        />
      </PageContainer>
    );
  };
}

export function createListingDetailLoadingPage(section: DirectorySectionConfig) {
  return function ListingDetailLoading() {
    return (
      <PageContainer
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: section.shortTitle, href: section.path },
          { label: "Loading..." },
        ]}
      >
        <div className="space-y-8" aria-busy aria-label="Loading listing details">
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full max-w-3xl" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  };
}

export function createListingDetailNotFoundPage(
  section: DirectorySectionConfig,
) {
  return function ListingDetailNotFound() {
    return (
      <PageContainer
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: section.shortTitle, href: section.path },
          { label: "Not found" },
        ]}
      >
        <div className="mx-auto max-w-xl space-y-4 text-center">
          <h1 className="text-h1">Listing not found</h1>
          <p className="text-body-sm text-muted-foreground">
            This listing may have been removed, is not approved yet, or the link
            may be incorrect.
          </p>
          <Link href={section.path} className={buttonVariants({ variant: "soft" })}>
            Browse all {section.shortTitle.toLowerCase()}
          </Link>
        </div>
      </PageContainer>
    );
  };
}
