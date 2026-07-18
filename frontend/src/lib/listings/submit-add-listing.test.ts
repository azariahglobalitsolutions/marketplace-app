import { afterEach, describe, expect, it, vi } from "vitest";

import { submitAddListing } from "@/lib/listings/submit-add-listing";

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
  start_time: "",
  end_time: "",
  picture: undefined,
  acceptTerms: true,
};

describe("submitAddListing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts multipart payloads to the BFF route", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Listing submitted for admin approval",
          listing: {
            id: 12,
            category: "restaurants",
            title: "Habesha Kitchen",
            description: "Traditional injera and wot.",
            state: "Virginia",
            city: "Arlington",
            status: "pending",
          },
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await submitAddListing(validValues);

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/listings");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
    expect(init.body).toBeInstanceOf(FormData);
  });

  it("maps backend validation errors to fields", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Invalid US state" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await submitAddListing(validValues);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.state).toBe("Invalid US state");
      expect(result.status).toBe(400);
    }
  });
});
