"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { CategoryFilter } from "@/components/directory/category-filter";
import { LocationFilter } from "@/components/directory/location-filter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DIRECTORY_CLIENT_FILTER_NOTICE } from "@/lib/directory/capabilities";
import type { DirectoryFilterSupport } from "@/lib/directory/sections";
import { cn } from "@/lib/utils";

export type ListingFilterValues = {
  state: string;
  city: string;
};

type ListingFiltersBaseProps = {
  values: ListingFilterValues;
  states: string[];
  cities: string[];
  filterSupport: DirectoryFilterSupport;
  onApply: (values: ListingFilterValues) => void;
  onReset: () => void;
};

function ListingFiltersForm({
  idPrefix,
  values,
  states,
  cities,
  filterSupport,
  onChange,
  onApply,
  onReset,
}: ListingFiltersBaseProps & {
  idPrefix: string;
  onChange: (values: ListingFilterValues) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const usesClientFilters = filterSupport.city || filterSupport.pagination;

  return (
    <div className="space-y-5">
      {filterSupport.categoryNavigation ? (
        <CategoryFilter idPrefix={`${idPrefix}-category`} />
      ) : null}
      <LocationFilter
        idPrefix={idPrefix}
        state={values.state}
        city={values.city}
        states={states}
        cities={cities}
        filterSupport={filterSupport}
        onStateChange={(state) => onChange({ ...values, state })}
        onCityChange={(city) => onChange({ ...values, city })}
      />
      {usesClientFilters ? (
        <p
          className="text-caption rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2"
          data-dev-notice="directory-client-filters"
        >
          {DIRECTORY_CLIENT_FILTER_NOTICE}
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        <Button type="button" onClick={onApply}>
          Apply filters
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}

function SidebarFiltersDraft(props: ListingFiltersBaseProps) {
  const [draft, setDraft] = useState(props.values);

  return (
    <ListingFiltersForm
      idPrefix="desktop-directory"
      values={draft}
      states={props.states}
      cities={props.cities}
      filterSupport={props.filterSupport}
      onChange={setDraft}
      onApply={() => props.onApply(draft)}
      onReset={props.onReset}
    />
  );
}

export function ListingFiltersSidebar({
  className,
  ...props
}: ListingFiltersBaseProps & { className?: string }) {
  const remountKey = `${props.values.state}|${props.values.city}`;

  return (
    <aside
      className={cn(
        "hidden rounded-2xl border border-border bg-card p-5 shadow-sm lg:block",
        className,
      )}
      aria-label="Listing filters"
    >
      <h2 className="text-h3 mb-4">Filters</h2>
      <SidebarFiltersDraft key={remountKey} {...props} />
    </aside>
  );
}

export function ListingFiltersDrawer({
  activeFilterCount = 0,
  ...props
}: ListingFiltersBaseProps & { activeFilterCount?: number }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(props.values);

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setDraft(props.values);
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
          <SheetTitle>Filter listings</SheetTitle>
        </SheetHeader>
        <ListingFiltersForm
          idPrefix="mobile-directory"
          values={draft}
          states={props.states}
          cities={props.cities}
          filterSupport={props.filterSupport}
          onChange={setDraft}
          onApply={() => {
            props.onApply(draft);
            setOpen(false);
          }}
          onReset={() => {
            props.onReset();
            setOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
