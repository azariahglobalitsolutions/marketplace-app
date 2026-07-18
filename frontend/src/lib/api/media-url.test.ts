import { describe, expect, it } from "vitest";

import { resolveMediaUrl } from "@/lib/api/media-url";

describe("resolveMediaUrl", () => {
  it("returns undefined for empty values", () => {
    expect(resolveMediaUrl(null, "http://localhost:8080")).toBeUndefined();
    expect(resolveMediaUrl(undefined, "http://localhost:8080")).toBeUndefined();
  });

  it("returns absolute URLs unchanged", () => {
    expect(
      resolveMediaUrl("https://cdn.example.com/image.jpg", "http://localhost:8080"),
    ).toBe("https://cdn.example.com/image.jpg");
  });

  it("prefixes backend-relative upload paths", () => {
    expect(
      resolveMediaUrl("/uploads/picture_abc.jpg", "http://localhost:8080/"),
    ).toBe("http://localhost:8080/uploads/picture_abc.jpg");
  });
});
