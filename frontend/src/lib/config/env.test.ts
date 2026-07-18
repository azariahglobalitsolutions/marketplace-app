import { afterEach, describe, expect, it } from "vitest";
import {
  getPublicApiBaseUrl,
  isPublicApiBaseUrlConfigured,
} from "@/lib/config/env";

const ENV_KEY = "NEXT_PUBLIC_API_BASE_URL";

describe("getPublicApiBaseUrl", () => {
  const original = process.env[ENV_KEY];

  afterEach(() => {
    if (original === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = original;
    }
  });

  it("throws when the variable is missing", () => {
    delete process.env[ENV_KEY];

    expect(() => getPublicApiBaseUrl()).toThrow(
      "NEXT_PUBLIC_API_BASE_URL is not set",
    );
    expect(isPublicApiBaseUrlConfigured()).toBe(false);
  });

  it("throws when the variable is blank", () => {
    process.env[ENV_KEY] = "   ";

    expect(() => getPublicApiBaseUrl()).toThrow(
      "NEXT_PUBLIC_API_BASE_URL is not set",
    );
    expect(isPublicApiBaseUrlConfigured()).toBe(false);
  });

  it("returns a trimmed URL without a trailing slash", () => {
    process.env[ENV_KEY] = " http://localhost:8080/ ";

    expect(getPublicApiBaseUrl()).toBe("http://localhost:8080");
    expect(isPublicApiBaseUrlConfigured()).toBe(true);
  });
});
