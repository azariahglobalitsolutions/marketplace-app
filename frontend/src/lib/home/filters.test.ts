import { describe, expect, it } from "vitest";

import {
  filterListingsByKeyword,
  pickUpcomingEvents,
  selectFeaturedListings,
} from "@/lib/home/filters";
import type { ListingResponse } from "@/types/api";

const sample = (
  overrides: Partial<ListingResponse> & Pick<ListingResponse, "id" | "title">,
): ListingResponse => ({
  category: "events",
  description: "Sample description",
  state: "Maryland",
  city: "Silver Spring",
  status: "approved",
  ...overrides,
});

describe("filterListingsByKeyword", () => {
  it("returns all listings when keyword is empty", () => {
    const listings = [sample({ id: 1, title: "Coffee Ceremony" })];
    expect(filterListingsByKeyword(listings, "  ")).toEqual(listings);
  });

  it("matches title, description, city, state, and venue", () => {
    const listings = [
      sample({ id: 1, title: "Injera Night", city: "Arlington" }),
      sample({ id: 2, title: "Jazz Night", venue: "Injera Lounge" }),
    ];

    expect(filterListingsByKeyword(listings, "injera")).toHaveLength(2);
    expect(filterListingsByKeyword(listings, "arlington")).toHaveLength(1);
  });
});

describe("pickUpcomingEvents", () => {
  it("sorts by event_date and limits results", () => {
    const listings = [
      sample({ id: 1, title: "Later", event_date: "2026-12-01" }),
      sample({ id: 2, title: "Soon", event_date: "2026-08-01" }),
      sample({ id: 3, title: "Unscheduled" }),
    ];

    expect(pickUpcomingEvents(listings, 2).map((item) => item.id)).toEqual([
      2, 1,
    ]);
  });
});

describe("selectFeaturedListings", () => {
  it("round-robins across categories without duplicates", () => {
    const featured = selectFeaturedListings(
      [
        [sample({ id: 1, title: "A", category: "restaurants" })],
        [sample({ id: 2, title: "B", category: "health" })],
        [sample({ id: 3, title: "C", category: "education" })],
      ],
      3,
    );

    expect(featured.map((item) => item.id)).toEqual([1, 2, 3]);
  });
});
