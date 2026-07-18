import { describe, expect, it } from "vitest";

import { processEventsForPage } from "@/lib/events/process-events-page";
import type { ListingResponse } from "@/types/api";

const sample = (
  overrides: Partial<ListingResponse> & Pick<ListingResponse, "id" | "event_date">,
): ListingResponse => ({
  category: "events",
  title: `Event ${overrides.id}`,
  description: "Description",
  state: "Maryland",
  city: "Silver Spring",
  status: "approved",
  ...overrides,
});

describe("processEventsForPage", () => {
  const reference = new Date("2026-07-18T12:00:00");

  it("filters, groups, and paginates events for the page", () => {
    const events = Array.from({ length: 30 }, (_, index) =>
      sample({
        id: index + 1,
        event_date: `2026-08-${String((index % 28) + 1).padStart(2, "0")}`,
        city: index % 2 === 0 ? "Silver Spring" : "Bethesda",
      }),
    );

    const result = processEventsForPage(
      events,
      { page: 2, city: "Silver Spring" },
      reference,
    );

    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalItems).toBe(15);
    expect(result.displayGroups.upcoming.length).toBeGreaterThan(0);
  });
});
