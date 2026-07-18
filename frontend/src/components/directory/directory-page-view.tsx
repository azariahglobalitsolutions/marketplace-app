"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ListingEmptyState } from "@/components/directory/listing-empty-state";
import { ListingErrorState } from "@/components/directory/listing-error-state";
import {
  ListingFiltersDrawer,
  ListingFiltersSidebar,
} from "@/components/directory/listing-filters";
import { ListingGrid } from "@/components/directory/listing-grid";
import { Pagination } from "@/components/directory/pagination";
import { SectionHeading } from "@/components/layout/section-heading";
import {
  countActiveDirectoryFilters,
  filtersToQueryString,
  type DirectoryFilters,
} from "@/lib/directory/filters";
import { processDirectoryPage } from "@/lib/directory/process-directory-page";
import type { DirectorySectionConfig } from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";

type DirectoryPageViewProps = {
  section: DirectorySectionConfig;
  listings: ListingResponse[];
  states: string[];
  apiBaseUrl: string;
  filters: DirectoryFilters;
  error?: string;
};

export function DirectoryPageView({
  section,
  listings,
  states,
  apiBaseUrl,
  filters,
  error,
}: DirectoryPageViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const processed = useMemo(
    () => processDirectoryPage(listings, filters),
    [listings, filters],
  );

  const formValues = {
    state: filters.state ?? "",
    city: filters.city ?? "",
  };

  function navigate(next: DirectoryFilters) {
    router.push(`${pathname}${filtersToQueryString(next)}`, { scroll: false });
  }

  function applyForm(values: { state: string; city: string }) {
    navigate({
      state: values.state || undefined,
      city: values.city || undefined,
      page: 1,
    });
  }

  function resetFilters() {
    navigate({ page: 1 });
  }

  const activeFilterCount = countActiveDirectoryFilters(filters);
  const showEmpty =
    !error && processed.pagination.totalItems === 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ListingFiltersSidebar
        values={formValues}
        states={states}
        cities={processed.cities}
        onApply={applyForm}
        onReset={resetFilters}
      />

      <div className="min-w-0 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            as="h1"
            title={section.title}
            description={section.description}
            className="mb-0"
          />
          <ListingFiltersDrawer
            values={formValues}
            states={states}
            cities={processed.cities}
            onApply={applyForm}
            onReset={resetFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {error ? (
          <ListingErrorState
            message={error}
            onRetry={() => router.refresh()}
          />
        ) : null}

        {!error && showEmpty ? (
          <ListingEmptyState
            section={section}
            hasActiveFilters={activeFilterCount > 0}
          />
        ) : null}

        {!error && processed.listings.length > 0 ? (
          <>
            <ListingGrid
              listings={processed.listings}
              apiBaseUrl={apiBaseUrl}
              section={section}
            />
            <Pagination
              pagination={processed.pagination}
              onPageChange={(page) => navigate({ ...filters, page })}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export function DirectoryPageViewSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="hidden h-96 rounded-2xl bg-muted lg:block" aria-hidden />
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
