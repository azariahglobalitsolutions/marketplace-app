import { describe, expect, it } from "vitest";

import { formatEventAddress } from "@/lib/events/address";
import { buildIcsCalendarContent } from "@/lib/events/calendar";
import { isExpiredEvent } from "@/lib/events/event-status";
import { buildEventJsonLd } from "@/lib/events/json-ld";
import {
  buildEventCanonicalPath,
  parseEventSlug,
} from "@/lib/events/slug";
import type { ListingResponse } from "@/types/api";

const sampleEvent: ListingResponse = {
  id: 42,
  category: "events",
  title: "Coffee Ceremony Workshop",
  description: "Learn traditional coffee ceremony.",
  state: "Maryland",
  city: "Silver Spring",
  venue: "Community Center",
  event_date: "2026-09-11",
  start_time: "18:00",
  end_time: "20:00",
  image_url: "/uploads/picture_test.jpg",
  status: "approved",
};

describe("parseEventSlug", () => {
  it("parses numeric slugs", () => {
    expect(parseEventSlug("42")).toBe(42);
    expect(parseEventSlug("42-coffee-ceremony")).toBe(42);
    expect(parseEventSlug("invalid")).toBeNull();
  });
});

describe("buildEventCanonicalPath", () => {
  it("builds stable canonical paths", () => {
    expect(buildEventCanonicalPath(42)).toBe("/events/42");
  });
});

describe("formatEventAddress", () => {
  it("formats venue and locality without inventing street data", () => {
    expect(formatEventAddress(sampleEvent)).toEqual({
      lines: ["Community Center", "Silver Spring, Maryland"],
      singleLine: "Community Center, Silver Spring, Maryland",
    });
  });
});

describe("isExpiredEvent", () => {
  it("detects past event dates", () => {
    expect(isExpiredEvent("2020-01-01", new Date("2026-07-18"))).toBe(true);
    expect(isExpiredEvent("2026-09-11", new Date("2026-07-18"))).toBe(false);
    expect(isExpiredEvent(null, new Date("2026-07-18"))).toBe(false);
  });
});

describe("buildIcsCalendarContent", () => {
  it("creates an ICS file from API event fields", () => {
    const content = buildIcsCalendarContent(sampleEvent);

    expect(content).toContain("BEGIN:VCALENDAR");
    expect(content).toContain("SUMMARY:Coffee Ceremony Workshop");
    expect(content).toContain("DTSTART;TZID=America/New_York:20260911T180000");
  });

  it("returns null when no event date exists", () => {
    expect(buildIcsCalendarContent({ ...sampleEvent, event_date: null })).toBeNull();
  });
});

describe("buildEventJsonLd", () => {
  it("includes only fields available from the listing DTO", () => {
    const jsonLd = buildEventJsonLd({
      event: sampleEvent,
      apiBaseUrl: "http://localhost:8080",
      siteUrl: "http://localhost:3000",
      isExpired: false,
    });

    expect(jsonLd.name).toBe("Coffee Ceremony Workshop");
    expect(jsonLd.startDate).toBe("2026-09-11T18:00:00");
    expect(jsonLd.location?.address.addressLocality).toBe("Silver Spring");
    expect(jsonLd.image).toEqual([
      "http://localhost:8080/uploads/picture_test.jpg",
    ]);
    expect(jsonLd.organizer).toBeUndefined();
  });
});
