import { createServerApiClient } from "@/lib/api/server";
import { isApiError } from "@/lib/api/errors";
import { isPublicApiBaseUrlConfigured } from "@/lib/config/env";
import type { DirectorySectionConfig } from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";

const RELATED_LISTINGS_LIMIT = 3;

export type ListingDetailData =
  | { notFound: true }
  | {
      notFound: false;
      listing: ListingResponse;
      relatedListings: ListingResponse[];
      apiBaseUrl: string;
      error?: string;
    };

function errorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load listing details.";
}

export async function getListingDetailData(
  section: DirectorySectionConfig,
  listingId: number,
): Promise<ListingDetailData> {
  if (!isPublicApiBaseUrlConfigured()) {
    return { notFound: true };
  }

  const api = createServerApiClient();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";

  try {
    const detail = await api.getListing(listingId);

    if (detail.listing.category !== section.category) {
      return { notFound: true };
    }

    let relatedListings: ListingResponse[] = [];
    let error: string | undefined;

    const relatedResult = await Promise.allSettled([
      api.getListings({
        category: section.category,
        state: detail.listing.state,
      }),
    ]);

    if (relatedResult[0].status === "fulfilled") {
      relatedListings = relatedResult[0].value.listings
        .filter((listing) => listing.id !== listingId)
        .slice(0, RELATED_LISTINGS_LIMIT);
    } else {
      error = errorMessage(relatedResult[0].reason);
    }

    return {
      notFound: false,
      listing: detail.listing,
      relatedListings,
      apiBaseUrl,
      error,
    };
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      return { notFound: true };
    }

    throw error;
  }
}
