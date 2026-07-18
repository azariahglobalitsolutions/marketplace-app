/**
 * Event detail routes use the numeric listing ID as the slug segment.
 * Example: /events/42
 */
export function parseEventSlug(slug: string): number | null {
  const idPart = slug.split("-")[0] ?? slug;
  const id = Number.parseInt(idPart, 10);

  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  return id;
}

export function buildEventCanonicalPath(listingId: number): string {
  return `/events/${listingId}`;
}
