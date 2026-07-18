import type { ListingResponse } from "@/types/api";

/**
 * Client-side keyword filter used until the backend exposes search.
 */
export function filterListingsByKeyword(
  listings: ListingResponse[],
  keyword: string | undefined,
): ListingResponse[] {
  const query = keyword?.trim().toLowerCase();
  if (!query) {
    return listings;
  }

  return listings.filter((listing) => {
    const haystack = [
      listing.title,
      listing.description,
      listing.city,
      listing.state,
      listing.venue,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function pickUpcomingEvents(
  events: ListingResponse[],
  limit: number,
): ListingResponse[] {
  const sorted = [...events].sort((left, right) => {
    const leftDate = left.event_date ?? "9999-12-31";
    const rightDate = right.event_date ?? "9999-12-31";
    return leftDate.localeCompare(rightDate);
  });

  return sorted.slice(0, limit);
}

export function selectFeaturedListings(
  listingsByCategory: ListingResponse[][],
  limit: number,
): ListingResponse[] {
  const featured: ListingResponse[] = [];
  const seen = new Set<number>();
  let round = 0;

  while (featured.length < limit) {
    let added = false;

    for (const listings of listingsByCategory) {
      const listing = listings[round];
      if (!listing || seen.has(listing.id)) {
        continue;
      }

      seen.add(listing.id);
      featured.push(listing);
      added = true;

      if (featured.length >= limit) {
        break;
      }
    }

    if (!added) {
      break;
    }

    round += 1;
  }

  return featured;
}
