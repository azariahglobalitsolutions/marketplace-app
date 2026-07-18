import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearAccessToken, setAccessToken } from "@/lib/auth/access-token";
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
  const storage = new Map<string, string>();

  beforeEach(() => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
        removeItem: (key: string) => {
          storage.delete(key);
        },
      },
    });
  });

  afterEach(() => {
    storage.clear();
    clearAccessToken();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("posts JSON payloads without an image", async () => {
    setAccessToken("test-token");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");

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
    expect(url).toBe("http://localhost:8080/api/listings");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("Authorization")).toBe(
      "Bearer test-token",
    );
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json",
    );
    expect(JSON.parse(String(init.body))).toMatchObject({
      category: "restaurants",
      title: "Habesha Kitchen",
      city: "Arlington",
      state: "Virginia",
    });
  });

  it("maps backend validation errors to fields", async () => {
    setAccessToken("test-token");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");

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
