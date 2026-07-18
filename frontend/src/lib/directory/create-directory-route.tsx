import type { Metadata } from "next";
import { Suspense } from "react";

import { DirectoryPageView, DirectoryPageViewSkeleton } from "@/components/directory/directory-page-view";
import { PageContainer } from "@/components/layout/page-container";
import { brand } from "@/lib/brand";
import { parseDirectoryFilters } from "@/lib/directory/filters";
import { getDirectoryPageData } from "@/lib/directory/get-directory-page-data";
import type { DirectorySectionConfig } from "@/lib/directory/sections";

export function createDirectoryMetadata(
  section: DirectorySectionConfig,
): (props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => Promise<Metadata> {
  return async function generateDirectoryMetadata({ searchParams }) {
    const filters = parseDirectoryFilters(await searchParams, section.filters);
    const locationSuffix = filters.state ? ` in ${filters.state}` : "";

    return {
      title: `${section.title}${locationSuffix}`,
      description: section.description,
      openGraph: {
        title: `${section.title}${locationSuffix} | ${brand.name}`,
        description: section.description,
        type: "website",
      },
      alternates: {
        canonical: section.path,
      },
    };
  };
}

export function createDirectoryPage(section: DirectorySectionConfig) {
  async function DirectoryPageContent({
    searchParams,
  }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }) {
    const filters = parseDirectoryFilters(await searchParams, section.filters);
    const data = await getDirectoryPageData(section, filters.state);

    return (
      <DirectoryPageView
        section={section}
        listings={data.listings}
        states={data.states}
        apiBaseUrl={data.apiBaseUrl}
        filters={filters}
        error={data.error}
      />
    );
  }

  return function DirectoryPage({
    searchParams,
  }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }) {
    return (
      <PageContainer
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: section.shortTitle },
        ]}
      >
        <Suspense fallback={<DirectoryPageViewSkeleton />}>
          <DirectoryPageContent searchParams={searchParams} />
        </Suspense>
      </PageContainer>
    );
  };
}

export function createDirectoryLoadingPage(section: DirectorySectionConfig) {
  return function DirectoryLoading() {
    return (
      <PageContainer
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: section.shortTitle },
        ]}
      >
        <DirectoryPageViewSkeleton />
      </PageContainer>
    );
  };
}
