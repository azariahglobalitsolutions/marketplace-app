"use client";

import { useId } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EVENTS_CLIENT_FILTERS,
  EVENTS_PAID_FILTER_SUPPORTED,
} from "@/lib/dev/client-features";
import { cn } from "@/lib/utils";

export type EventFiltersFormValues = {
  state: string;
  city: string;
  date: string;
};

type EventFiltersFormProps = {
  values: EventFiltersFormValues;
  states: string[];
  cities: string[];
  onChange: (values: EventFiltersFormValues) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
  idPrefix?: string;
};

export function EventFiltersForm({
  values,
  states,
  cities,
  onChange,
  onApply,
  onReset,
  className,
  idPrefix: idPrefixProp,
}: EventFiltersFormProps) {
  const autoId = useId();
  const idPrefix = idPrefixProp ?? autoId;

  return (
    <div className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-state`}>State</Label>
        <select
          id={`${idPrefix}-state`}
          value={values.state}
          onChange={(event) =>
            onChange({ ...values, state: event.target.value })
          }
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All states</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <p className="text-caption text-muted-foreground">
          Sent to the backend via GET /api/events?state=
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-city`}>City</Label>
        <select
          id={`${idPrefix}-city`}
          value={values.city}
          onChange={(event) =>
            onChange({ ...values, city: event.target.value })
          }
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          disabled={cities.length === 0}
        >
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-date`}>Date</Label>
        <Input
          id={`${idPrefix}-date`}
          type="date"
          value={values.date}
          onChange={(event) =>
            onChange({ ...values, date: event.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-category`}>Event category</Label>
        <select
          id={`${idPrefix}-category`}
          value="events"
          disabled
          className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground"
        >
          <option value="events">Habesha Event &amp; Activities</option>
        </select>
        <p className="text-caption text-muted-foreground">
          All events on this page use the events listing category.
        </p>
      </div>

      {!EVENTS_PAID_FILTER_SUPPORTED ? (
        <p className="text-caption rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-muted-foreground">
          Free or paid filtering is not available — the backend listing DTO does
          not include ticket pricing fields.
        </p>
      ) : null}

      {EVENTS_CLIENT_FILTERS.city || EVENTS_CLIENT_FILTERS.date ? (
        <p
          className="text-caption rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2"
          data-dev-notice="events-client-filters"
        >
          {EVENTS_CLIENT_FILTERS.notice}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="flex-1" onClick={onApply}>
          Apply filters
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
