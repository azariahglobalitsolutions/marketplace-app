import { createServerApiClient } from "@/lib/api/server";
import { isApiError } from "@/lib/api/errors";
import { getPublicApiBaseUrl, isPublicApiBaseUrlConfigured } from "@/lib/config/env";
import type { ListingResponse } from "@/types/api";

const RELATED_EVENTS_LIMIT = 3;

export type EventDetailData =
  | { notFound: true }
  | { serverError: true; message: string }
  | {
      notFound: false;
      event: ListingResponse;
      relatedEvents: ListingResponse[];
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

  return "Unable to load event details.";
}

export async function getEventDetailData(
  listingId: number,
): Promise<EventDetailData> {
  if (!isPublicApiBaseUrlConfigured()) {
    return { notFound: true };
  }

  const api = createServerApiClient();
  const apiBaseUrl = getPublicApiBaseUrl();

  try {
    const detail = await api.getListing(listingId);

    if (detail.listing.category !== "events") {
      return { notFound: true };
    }

    let relatedEvents: ListingResponse[] = [];
    let error: string | undefined;

    const relatedResult = await Promise.allSettled([
      api.getEvents({ state: detail.listing.state }),
    ]);

    if (relatedResult[0].status === "fulfilled") {
      relatedEvents = relatedResult[0].value.events
        .filter((event) => event.id !== listingId)
        .slice(0, RELATED_EVENTS_LIMIT);
    } else {
      error = errorMessage(relatedResult[0].reason);
    }

    return {
      notFound: false,
      event: detail.listing,
      relatedEvents,
      apiBaseUrl,
      error,
    };
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      return { notFound: true };
    }

    return {
      serverError: true,
      message: errorMessage(error),
    };
  }
}
