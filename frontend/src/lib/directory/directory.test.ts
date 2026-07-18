import { describe, expect, it } from "vitest";

import { DIRECTORY_API_CAPABILITIES } from "@/lib/directory/capabilities";
import {
  applyDirectoryFilters,
  filtersToQueryString,
  paginateItems,
  parseDirectoryFilters,
  sanitizeDirectoryFilters,
} from "@/lib/directory/filters";
import { processDirectoryPage } from "@/lib/directory/process-directory-page";
import {
  BACKEND_ONLY_DIRECTORY_FILTERS,
  DIRECTORY_SECTION_LIST,
  FULL_DIRECTORY_FILTERS,
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
    expect(getDirectorySectionByPath("/health-wellness")?.category).toBe(
      "health",
    );
  });

  it("limits restaurants to backend-supported state filters", () => {
    expect(getDirectorySectionByPath("/restaurants")?.filters).toEqual(
      BACKEND_ONLY_DIRECTORY_FILTERS,
    );
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

  it("drops unsupported filters for backend-only sections", () => {
    expect(
      parseDirectoryFilters(
        {
          state: "Virginia",
          city: "Arlington",
          page: "2",
        },
        BACKEND_ONLY_DIRECTORY_FILTERS,
      ),
    ).toEqual({
      state: "Virginia",
      city: undefined,
      page: 1,
    });
  });
});

describe("sanitizeDirectoryFilters", () => {
  it("keeps only state when city and pagination are disabled", () => {
    expect(
      sanitizeDirectoryFilters(
        { state: "Texas", city: "Dallas", page: 3 },
        BACKEND_ONLY_DIRECTORY_FILTERS,
      ),
    ).toEqual({
      state: "Texas",
      city: undefined,
      page: 1,
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

    const result = processDirectoryPage(
      listings,
      { page: 2 },
      FULL_DIRECTORY_FILTERS,
    );

    expect(result.listings).toHaveLength(2);
    expect(result.pagination.page).toBe(2);
  });

  it("returns all listings when pagination is disabled", () => {
    const listings = Array.from({ length: 14 }, (_, index) =>
      listing({ id: index + 1, title: `Listing ${index + 1}` }),
    );

    const result = processDirectoryPage(
      listings,
      { page: 2 },
      BACKEND_ONLY_DIRECTORY_FILTERS,
    );

    expect(result.listings).toHaveLength(14);
    expect(result.pagination.totalPages).toBe(1);
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

  it("omits unsupported filters for backend-only sections", () => {
    expect(
      filtersToQueryString(
        {
          state: "Texas",
          city: "Dallas",
          page: 2,
        },
        BACKEND_ONLY_DIRECTORY_FILTERS,
      ),
    ).toBe("?state=Texas");
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
