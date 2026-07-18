"use client";

import { Label } from "@/components/ui/label";
import type { DirectoryFilterSupport } from "@/lib/directory/sections";
import { cn } from "@/lib/utils";

type LocationFilterProps = {
  idPrefix: string;
  state: string;
  city: string;
  states: string[];
  cities: string[];
  filterSupport: DirectoryFilterSupport;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  className?: string;
};

export function LocationFilter({
  idPrefix,
  state,
  city,
  states,
  cities,
  filterSupport,
  onStateChange,
  onCityChange,
  className,
}: LocationFilterProps) {
  if (!filterSupport.state && !filterSupport.city) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {filterSupport.state ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-state`}>State</Label>
          <select
            id={`${idPrefix}-state`}
            value={state}
            onChange={(event) => onStateChange(event.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All states</option>
            {states.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
          <p className="text-caption text-muted-foreground">
            Sent to GET /api/listings?state=
          </p>
        </div>
      ) : null}

      {filterSupport.city ? (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-city`}>City</Label>
          <select
            id={`${idPrefix}-city`}
            value={city}
            onChange={(event) => onCityChange(event.target.value)}
            disabled={cities.length === 0}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
          >
            <option value="">All cities</option>
            {cities.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
