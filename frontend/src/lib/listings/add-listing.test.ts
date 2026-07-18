import { describe, expect, it } from "vitest";

import { mapListingApiErrorToFields } from "@/lib/listings/add-listing-errors";
import {
  addListingFormSchema,
  toCreateListingPayload,
} from "@/lib/listings/add-listing-schema";

const validValues = {
  title: "Habesha Kitchen",
  category: "restaurants" as const,
  description: "Traditional injera and wot.",
  contact_email: "owner@example.com",
  contact_phone: "5551234567",
  contact_phone_country: "US",
  venue: "123 Main St",
  city: "Arlington",
  state: "Virginia",
  start_time: "09:00",
  end_time: "21:00",
  picture: undefined,
  acceptTerms: true,
};

describe("addListingFormSchema", () => {
  it("accepts valid listing form values", () => {
    expect(addListingFormSchema.safeParse(validValues).success).toBe(true);
  });

  it("requires core listing fields", () => {
    const result = addListingFormSchema.safeParse({
      ...validValues,
      title: "",
      city: "",
      acceptTerms: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toContain("title");
      expect(fields).toContain("city");
      expect(fields).toContain("acceptTerms");
    }
  });

  it("rejects unsupported image types", () => {
    const file = new File(["x"], "menu.pdf", { type: "application/pdf" });
    const result = addListingFormSchema.safeParse({
      ...validValues,
      picture: file,
    });

    expect(result.success).toBe(false);
  });
});

describe("toCreateListingPayload", () => {
  it("maps form values to the backend create listing DTO", () => {
    expect(toCreateListingPayload(validValues)).toEqual({
      category: "restaurants",
      title: "Habesha Kitchen",
      description: "Traditional injera and wot.",
      state: "Virginia",
      city: "Arlington",
      venue: "123 Main St",
      contact_email: "owner@example.com",
      contact_phone: "5551234567",
      contact_phone_country: "US",
      start_time: "09:00",
      end_time: "21:00",
      picture: undefined,
    });
  });
});

describe("mapListingApiErrorToFields", () => {
  it("maps known backend validation messages to fields", () => {
    expect(
      mapListingApiErrorToFields("Title, description, state, and city are required"),
    ).toEqual({
      title: "Title, description, state, and city are required",
      description: "Title, description, state, and city are required",
      state: "Title, description, state, and city are required",
      city: "Title, description, state, and city are required",
    });
  });

  it("falls back to a form-level error", () => {
    expect(mapListingApiErrorToFields("Unexpected failure")).toEqual({
      _form: "Unexpected failure",
    });
  });
});
