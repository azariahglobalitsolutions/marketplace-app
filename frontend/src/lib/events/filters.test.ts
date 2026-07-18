import { describe, expect, it } from "vitest";

import {
  applyEventFilters,
  buildEventSearchParams,
  extractCities,
  paginateItems,
  parseEventFilters,
} from "@/lib/events/filters";
import type { ListingResponse } from "@/types/api";

const event = (
  overrides: Partial<ListingResponse> & Pick<ListingResponse, "id" | "title">,
): ListingResponse => ({
  category: "events",
  description: "Description",
  state: "Maryland",
  city: "Silver Spring",
  status: "approved",
  ...overrides,
});

describe("parseEventFilters", () => {
  it("parses shareable URL parameters", () => {
    expect(
      parseEventFilters({
        state: "Virginia",
        city: "Arlington",
        date: "2026-08-01",
        page: "2",
      }),
    ).toEqual({
      state: "Virginia",
      city: "Arlington",
      date: "2026-08-01",
      page: 2,
    });
  });
});

describe("buildEventSearchParams", () => {
  it("serializes active filters", () => {
    const params = buildEventSearchParams({
      state: "Texas",
      city: "Dallas",
      date: "2026-08-15",
      page: 3,
    });

    expect(params.toString()).toBe(
      "state=Texas&city=Dallas&date=2026-08-15&page=3",
    );
  });
});

describe("applyEventFilters", () => {
  it("filters by city and exact date", () => {
    const events = [
      event({ id: 1, title: "A", city: "Dallas", event_date: "2026-08-01" }),
      event({ id: 2, title: "B", city: "Austin", event_date: "2026-08-02" }),
    ];

    expect(
      applyEventFilters(events, { city: "Dallas", date: "2026-08-01" }),
    ).toHaveLength(1);
  });
});

describe("extractCities", () => {
  it("returns sorted unique cities", () => {
    const cities = extractCities([
      event({ id: 1, title: "A", city: "Dallas" }),
      event({ id: 2, title: "B", city: "Austin" }),
      event({ id: 3, title: "C", city: "Dallas" }),
    ]);

    expect(cities).toEqual(["Austin", "Dallas"]);
  });
});

describe("paginateItems", () => {
  it("slices items for the requested page", () => {
    const items = [1, 2, 3, 4, 5];
    const result = paginateItems(items, 2, 2);

    expect(result.items).toEqual([3, 4]);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);
  });
});
