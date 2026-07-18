"use client";

import { useState } from "react";

import {
  EventFiltersForm,
  type EventFiltersFormValues,
} from "@/components/events/event-filters-form";
import { cn } from "@/lib/utils";

type EventsFilterSidebarProps = {
  values: EventFiltersFormValues;
  states: string[];
  cities: string[];
  onApply: (values: EventFiltersFormValues) => void;
  onReset: () => void;
  className?: string;
};

function SidebarFilters({
  values,
  states,
  cities,
  onApply,
  onReset,
}: Omit<EventsFilterSidebarProps, "className">) {
  const [draft, setDraft] = useState(values);

  return (
    <EventFiltersForm
      idPrefix="desktop-events"
      values={draft}
      states={states}
      cities={cities}
      onChange={setDraft}
      onApply={() => onApply(draft)}
      onReset={onReset}
    />
  );
}

export function EventsFilterSidebar({
  values,
  states,
  cities,
  onApply,
  onReset,
  className,
}: EventsFilterSidebarProps) {
  const remountKey = `${values.state}|${values.city}|${values.date}`;

  return (
    <aside
      className={cn(
        "hidden rounded-2xl border border-border bg-card p-5 shadow-sm lg:block",
        className,
      )}
      aria-label="Event filters"
    >
      <h2 className="text-h3 mb-4">Filters</h2>
      <SidebarFilters
        key={remountKey}
        values={values}
        states={states}
        cities={cities}
        onApply={onApply}
        onReset={onReset}
      />
    </aside>
  );
}
