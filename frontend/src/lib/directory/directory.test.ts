import { describe, expect, it } from "vitest";

import { DIRECTORY_API_CAPABILITIES } from "@/lib/directory/capabilities";
import {
  applyDirectoryFilters,
  filtersToQueryString,
  paginateItems,
  parseDirectoryFilters,
} from "@/lib/directory/filters";
import { processDirectoryPage } from "@/lib/directory/process-directory-page";
import {
  DIRECTORY_SECTION_LIST,
  getDirectorySectionByPath,
} from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";

const listing = (
  overrides: Partial<ListingResponse> & Pick<ListingResponse, "id" | "title">,
): ListingResponse => ({
  category: "restaurants",
  description: "Sample listing",
  state: "Maryland",
  city: "Silver Spring",
  status: "approved",
  ...overrides,
});

describe("directory sections", () => {
  it("defines four directory sections with unique paths", () => {
    expect(DIRECTORY_SECTION_LIST).toHaveLength(4);
    expect(getDirectorySectionByPath("/health")?.category).toBe("health");
  });
});

describe("parseDirectoryFilters", () => {
  it("parses shareable directory URL parameters", () => {
    expect(
      parseDirectoryFilters({
        state: "Virginia",
        city: "Arlington",
        page: "2",
      }),
    ).toEqual({
      state: "Virginia",
      city: "Arlington",
      page: 2,
    });
  });
});

describe("applyDirectoryFilters", () => {
  it("filters listings by city on the client", () => {
    const listings = [
      listing({ id: 1, title: "A", city: "Dallas" }),
      listing({ id: 2, title: "B", city: "Austin" }),
    ];

    expect(applyDirectoryFilters(listings, { city: "Dallas" })).toHaveLength(1);
  });
});

describe("processDirectoryPage", () => {
  it("paginates filtered listings for the current page", () => {
    const listings = Array.from({ length: 14 }, (_, index) =>
      listing({ id: index + 1, title: `Listing ${index + 1}` }),
    );

    const result = processDirectoryPage(listings, { page: 2 });

    expect(result.listings).toHaveLength(2);
    expect(result.pagination.page).toBe(2);
  });
});

describe("filtersToQueryString", () => {
  it("builds shareable query strings", () => {
    expect(
      filtersToQueryString({
        state: "Texas",
        city: "Dallas",
        page: 2,
      }),
    ).toBe("?state=Texas&city=Dallas&page=2");
  });
});

describe("DIRECTORY_API_CAPABILITIES", () => {
  it("documents missing backend pagination and city filters", () => {
    expect(DIRECTORY_API_CAPABILITIES.missing.serverPagination.reason).toMatch(
      /page/i,
    );
    expect(DIRECTORY_API_CAPABILITIES.missing.serverCityFilter.reason).toMatch(
      /city/i,
    );
  });
});

describe("paginateItems", () => {
  it("returns the requested page slice", () => {
    const result = paginateItems([1, 2, 3, 4, 5], 2, 2);
    expect(result.items).toEqual([3, 4]);
  });
});
