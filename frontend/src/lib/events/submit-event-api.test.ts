import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearAccessToken, setAccessToken } from "@/lib/auth/access-token";
import { submitEvent } from "@/lib/events/submit-event";

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

describe("submitEvent", () => {
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

  it("posts event payloads to POST /api/events", async () => {
    setAccessToken("test-token");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "Event submitted for admin approval",
          event: {
            id: 9,
            category: "events",
            title: "Coffee Ceremony Workshop",
            description: "Learn traditional coffee ceremony.",
            state: "Maryland",
            city: "Silver Spring",
            event_date: "2026-09-11",
            status: "pending",
          },
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await submitEvent(validValues);

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8080/api/events");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toMatchObject({
      title: "Coffee Ceremony Workshop",
      event_date: "2026-09-11",
      start_time: "18:00",
      end_time: "20:00",
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

    const result = await submitEvent(validValues);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.state).toBe("Invalid US state");
      expect(result.status).toBe(400);
    }
  });

  it("handles duplicate event responses", async () => {
    setAccessToken("test-token");
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Duplicate event already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await submitEvent(validValues);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors._form).toContain("Duplicate");
      expect(result.status).toBe(409);
    }
  });
});
