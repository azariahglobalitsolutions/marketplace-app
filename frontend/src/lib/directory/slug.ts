import type { DirectorySectionConfig } from "@/lib/directory/sections";

/**
 * Directory detail routes use the numeric listing ID as the slug segment.
 * Example: /restaurants/42
 */
export function parseListingSlug(slug: string): number | null {
  const idPart = slug.split("-")[0] ?? slug;
  const id = Number.parseInt(idPart, 10);

  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  return id;
}

export function buildListingCanonicalPath(
  section: Pick<DirectorySectionConfig, "path">,
  listingId: number,
): string {
  return `${section.path}/${listingId}`;
}
