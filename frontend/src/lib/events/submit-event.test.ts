import { describe, expect, it } from "vitest";

import { mapEventApiErrorToFields } from "@/lib/events/submit-event-errors";
import {
  submitEventFormSchema,
  toCreateEventPayload,
} from "@/lib/events/submit-event-schema";

const validValues = {
  title: "Coffee Ceremony Workshop",
  description: "Learn traditional coffee ceremony.",
  event_date: "2026-09-11",
  end_date: "2026-09-11",
  start_time: "18:00",
  end_time: "20:00",
  venue: "Community Center",
  address: "123 Main St",
  city: "Silver Spring",
  state: "Maryland",
  contact_email: "organizer@example.com",
  contact_phone: "5551234567",
  contact_phone_country: "US",
  acceptReview: true,
};

describe("submitEventFormSchema", () => {
  it("accepts valid event form values", () => {
    expect(submitEventFormSchema.safeParse(validValues).success).toBe(true);
  });

  it("requires end time to be after start time", () => {
    const result = submitEventFormSchema.safeParse({
      ...validValues,
      start_time: "20:00",
      end_time: "18:00",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "end_time")).toBe(
        true,
      );
    }
  });

  it("requires single-day events", () => {
    const result = submitEventFormSchema.safeParse({
      ...validValues,
      event_date: "2026-09-11",
      end_date: "2026-09-12",
    });

    expect(result.success).toBe(false);
  });
});

describe("toCreateEventPayload", () => {
  it("maps form values to the backend create event DTO", () => {
    expect(toCreateEventPayload(validValues)).toEqual({
      title: "Coffee Ceremony Workshop",
      description: "Learn traditional coffee ceremony.",
      state: "Maryland",
      city: "Silver Spring",
      venue: "Community Center, 123 Main St",
      event_date: "2026-09-11",
      start_time: "18:00",
      end_time: "20:00",
      contact_email: "organizer@example.com",
      contact_phone: "5551234567",
      contact_phone_country: "US",
    });
  });
});

describe("mapEventApiErrorToFields", () => {
  it("maps event date validation errors", () => {
    expect(mapEventApiErrorToFields("Event date is required for events")).toEqual({
      event_date: "Event date is required for events",
    });
  });

  it("maps duplicate responses to form and title fields", () => {
    expect(
      mapEventApiErrorToFields("Duplicate event already exists", 409),
    ).toEqual({
      _form: "Duplicate event already exists",
      title: "Duplicate event already exists",
    });
  });
});
