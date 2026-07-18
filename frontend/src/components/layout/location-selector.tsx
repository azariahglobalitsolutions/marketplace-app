"use client";

import { MapPin } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LocationSelectorProps = {
  className?: string;
};

export function LocationSelector({ className }: LocationSelectorProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <Label htmlFor="location-selector" className="sr-only">
        Location
      </Label>
      <div className="relative">
        <MapPin
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <select
          id="location-selector"
          defaultValue=""
          disabled
          aria-describedby="location-selector-help"
          className="h-10 w-full min-w-[10rem] appearance-none rounded-lg border border-input bg-card py-2 pr-8 pl-9 text-sm text-muted-foreground sm:h-9 sm:min-w-[11rem]"
        >
          <option value="">All States</option>
        </select>
      </div>
      <p id="location-selector-help" className="sr-only">
        State filter coming soon
      </p>
    </div>
  );
}
