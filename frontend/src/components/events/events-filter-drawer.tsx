"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import {
  EventFiltersForm,
  type EventFiltersFormValues,
} from "@/components/events/event-filters-form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type EventsFilterDrawerProps = {
  values: EventFiltersFormValues;
  states: string[];
  cities: string[];
  onApply: (values: EventFiltersFormValues) => void;
  onReset: () => void;
  activeFilterCount: number;
};

export function EventsFilterDrawer({
  values,
  states,
  cities,
  onApply,
  onReset,
  activeFilterCount,
}: EventsFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(values);

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setDraft(values);
        }
      }}
    >
      <SheetTrigger
        render={
          <Button variant="outline" className="lg:hidden" size="lg">
            <SlidersHorizontal aria-hidden />
            Filters
            {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </Button>
        }
      />
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter events</SheetTitle>
        </SheetHeader>
        <EventFiltersForm
          idPrefix="mobile-events"
          values={draft}
          states={states}
          cities={cities}
          onChange={setDraft}
          onApply={() => {
            onApply(draft);
            setOpen(false);
          }}
          onReset={() => {
            onReset();
            setOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
