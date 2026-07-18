import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { apiRequest, buildQuery } from "@/lib/api/request";

const ENV_KEY = "NEXT_PUBLIC_API_BASE_URL";

describe("apiRequest", () => {
  const original = process.env[ENV_KEY];

  afterEach(() => {
    if (original === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = original;
    }
    vi.restoreAllMocks();
  });

  it("returns parsed JSON for successful responses", async () => {
    process.env[ENV_KEY] = "http://localhost:8080";

    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "healthy" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await apiRequest<{ status: string }>("/health", {
      fetchImpl,
    });

    expect(result).toEqual({ status: "healthy" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://localhost:8080/health",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
  });

  it("attaches Authorization when accessToken is provided", async () => {
    process.env[ENV_KEY] = "http://localhost:8080";

    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: { id: 1 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await apiRequest("/api/auth/me", {
      accessToken: "test-token",
      fetchImpl,
    });

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Headers).get("Authorization")).toBe(
      "Bearer test-token",
    );
  });

  it("throws ApiError with backend error message for non-2xx JSON", async () => {
    process.env[ENV_KEY] = "http://localhost:8080";

    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      apiRequest("/api/auth/login", {
        method: "POST",
        body: { password: "secret" },
        fetchImpl,
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<ApiError>>({
        name: "ApiError",
        message: "Invalid credentials",
        status: 401,
      }),
    );
  });

  it("serializes JSON bodies and sets Content-Type", async () => {
    process.env[ENV_KEY] = "http://localhost:8080";

    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ token: "abc" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await apiRequest("/api/auth/login", {
      method: "POST",
      body: { email: "a@example.com", password: "secret1" },
      fetchImpl,
    });

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe(
      JSON.stringify({ email: "a@example.com", password: "secret1" }),
    );
    expect((init.headers as Headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("does not set Content-Type for FormData bodies", async () => {
    process.env[ENV_KEY] = "http://localhost:8080";

    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "ok" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const form = new FormData();
    form.append("title", "Test");

    await apiRequest("/api/listings", {
      method: "POST",
      body: form,
      fetchImpl,
    });

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBe(form);
    expect((init.headers as Headers).get("Content-Type")).toBeNull();
  });
});

describe("buildQuery", () => {
  it("omits empty values and encodes parameters", () => {
    expect(
      buildQuery({
        category: "events",
        state: "",
        page: undefined,
      }),
    ).toBe("?category=events");
  });
});
