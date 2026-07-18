"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { EventsFilterDrawer } from "@/components/events/events-filter-drawer";
import { EventsFilterSidebar } from "@/components/events/events-filter-sidebar";
import { EventsGroupedList } from "@/components/events/events-grouped-list";
import { EventsPagination } from "@/components/events/events-pagination";
import { SectionHeading } from "@/components/layout/section-heading";
import { EmptyState } from "@/components/patterns/empty-state";
import { ErrorState } from "@/components/patterns/error-state";
import { ListingGridSkeleton } from "@/components/patterns/loading-skeleton";
import {
  filtersToQueryString,
  type EventFilters,
} from "@/lib/events/filters";
import { processEventsForPage } from "@/lib/events/process-events-page";
import type { ListingResponse } from "@/types/api";

type EventsPageViewProps = {
  events: ListingResponse[];
  states: string[];
  apiBaseUrl: string;
  filters: EventFilters;
  error?: string;
};

function countActiveFilters(filters: EventFilters): number {
  return [filters.state, filters.city, filters.date].filter(Boolean).length;
}

export function EventsPageView({
  events,
  states,
  apiBaseUrl,
  filters,
  error,
}: EventsPageViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const processed = useMemo(
    () => processEventsForPage(events, filters),
    [events, filters],
  );

  const formValues = {
    state: filters.state ?? "",
    city: filters.city ?? "",
    date: filters.date ?? "",
  };

  function navigate(next: EventFilters) {
    router.push(`${pathname}${filtersToQueryString(next)}`, { scroll: false });
  }

  function applyForm(values: { state: string; city: string; date: string }) {
    navigate({
      state: values.state || undefined,
      city: values.city || undefined,
      date: values.date || undefined,
      page: 1,
    });
  }

  function resetFilters() {
    navigate({ page: 1 });
  }

  const activeFilterCount = countActiveFilters(filters);
  const showEmpty =
    !error && processed.pagination.totalItems === 0 && events.length >= 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <EventsFilterSidebar
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
            title="Habesha Events & Activities"
            description="Browse approved community events across the United States. Results update from the live API."
            className="mb-0"
          />
          <EventsFilterDrawer
            values={formValues}
            states={states}
            cities={processed.cities}
            onApply={applyForm}
            onReset={resetFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>

        {error ? (
          <ErrorState
            title="Could not load events"
            message={error}
            retryLabel="Reload page"
            onRetry={() => router.refresh()}
          />
        ) : null}

        {!error && showEmpty ? (
          <EmptyState
            title="No events match your filters"
            description={
              activeFilterCount > 0
                ? "Try clearing filters or choosing another state to see more Habesha events."
                : "There are no approved events to show right now. Check back soon or submit one for your community."
            }
            actionLabel="Submit an event"
            actionHref="/events/new"
          />
        ) : null}

        {!error && processed.pagination.totalItems > 0 ? (
          <>
            <EventsGroupedList
              groups={processed.displayGroups}
              apiBaseUrl={apiBaseUrl}
            />
            <EventsPagination
              pagination={processed.pagination}
              onPageChange={(page) => navigate({ ...filters, page })}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

export function EventsPageViewSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="hidden h-96 rounded-2xl bg-muted lg:block" aria-hidden />
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-xl bg-muted" />
        <ListingGridSkeleton count={6} />
      </div>
    </div>
  );
}
