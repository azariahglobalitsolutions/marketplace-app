import { describe, expect, it } from "vitest";

import { buildListingJsonLd } from "@/lib/directory/json-ld";
import {
  buildListingCanonicalPath,
  parseListingSlug,
} from "@/lib/directory/slug";
import { DIRECTORY_SECTIONS } from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";

const sampleRestaurant: ListingResponse = {
  id: 7,
  category: "restaurants",
  title: "Habesha Kitchen",
  description: "Traditional Ethiopian cuisine and coffee ceremony.",
  state: "Maryland",
  city: "Silver Spring",
  venue: "Downtown Plaza",
  image_url: "/uploads/picture_test.jpg",
  status: "approved",
};

describe("parseListingSlug", () => {
  it("parses numeric slugs", () => {
    expect(parseListingSlug("7")).toBe(7);
    expect(parseListingSlug("7-habesha-kitchen")).toBe(7);
    expect(parseListingSlug("invalid")).toBeNull();
  });
});

describe("buildListingCanonicalPath", () => {
  it("builds stable canonical paths for a section", () => {
    expect(
      buildListingCanonicalPath(DIRECTORY_SECTIONS.restaurants, 7),
    ).toBe("/restaurants/7");
  });
});

describe("buildListingJsonLd", () => {
  it("emits Restaurant JSON-LD from listing DTO fields", () => {
    const jsonLd = buildListingJsonLd({
      listing: sampleRestaurant,
      section: DIRECTORY_SECTIONS.restaurants,
      apiBaseUrl: "http://localhost:8080",
      siteUrl: "http://localhost:3000",
    });

    expect(jsonLd).not.toBeNull();
    expect(jsonLd?.["@type"]).toBe("Restaurant");
    expect(jsonLd?.name).toBe("Habesha Kitchen");
    expect(jsonLd?.address?.addressLocality).toBe("Silver Spring");
    expect(jsonLd?.image).toEqual([
      "http://localhost:8080/uploads/picture_test.jpg",
    ]);
    expect(jsonLd?.url).toBe("http://localhost:3000/restaurants/7");
  });

  it("returns null when the section has no schema type", () => {
    const section = {
      ...DIRECTORY_SECTIONS.restaurants,
      schemaType: undefined,
    };

    expect(
      buildListingJsonLd({
        listing: sampleRestaurant,
        section,
        apiBaseUrl: "http://localhost:8080",
        siteUrl: "http://localhost:3000",
      }),
    ).toBeNull();
  });
});
