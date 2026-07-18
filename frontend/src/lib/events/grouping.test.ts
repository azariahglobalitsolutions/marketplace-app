import { describe, expect, it } from "vitest";

import {
  classifyEventDate,
  groupEventsByTimeframe,
} from "@/lib/events/grouping";
import type { ListingResponse } from "@/types/api";

const sample = (
  overrides: Partial<ListingResponse> & Pick<ListingResponse, "id" | "event_date">,
): ListingResponse => ({
  category: "events",
  title: "Event",
  description: "Description",
  state: "Maryland",
  city: "Silver Spring",
  status: "approved",
  ...overrides,
});

describe("classifyEventDate", () => {
  const reference = new Date("2026-07-18T12:00:00");

  it("classifies today and tomorrow", () => {
    expect(
      classifyEventDate(new Date("2026-07-18T00:00:00"), reference),
    ).toBe("today");
    expect(
      classifyEventDate(new Date("2026-07-19T00:00:00"), reference),
    ).toBe("tomorrow");
  });

  it("classifies weekend days in the current week", () => {
    const wednesday = new Date("2026-07-15T12:00:00");

    expect(
      classifyEventDate(new Date("2026-07-18T00:00:00"), wednesday),
    ).toBe("this-weekend");
  });
});

describe("groupEventsByTimeframe", () => {
  it("groups events into ordered buckets", () => {
    const reference = new Date("2026-07-18T12:00:00");
    const groups = groupEventsByTimeframe(
      [
        sample({ id: 1, event_date: "2026-08-01" }),
        sample({ id: 2, event_date: "2026-07-18" }),
        sample({ id: 3, event_date: "2026-07-19" }),
      ],
      reference,
    );

    expect(groups.today.map((item) => item.id)).toEqual([2]);
    expect(groups.tomorrow.map((item) => item.id)).toEqual([3]);
    expect(groups.upcoming.map((item) => item.id)).toEqual([1]);
  });
});
