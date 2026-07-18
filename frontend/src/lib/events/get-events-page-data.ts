import { createServerApiClient } from "@/lib/api/server";
import { isPublicApiBaseUrlConfigured } from "@/lib/config/env";
import { isApiError } from "@/lib/api/errors";
import type { ListingResponse } from "@/types/api";

export type EventsPageData = {
  apiBaseUrl: string;
  events: ListingResponse[];
  states: string[];
  error?: string;
};

function errorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load events from the server.";
}

export async function getEventsPageData(state?: string): Promise<EventsPageData> {
  if (!isPublicApiBaseUrlConfigured()) {
    return {
      apiBaseUrl: "",
      events: [],
      states: [],
      error: "NEXT_PUBLIC_API_BASE_URL is not configured.",
    };
  }

  const api = createServerApiClient();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";

  const [eventsResult, statesResult] = await Promise.allSettled([
    api.getEvents({ state }),
    api.getListingStates(),
  ]);

  let events: ListingResponse[] = [];
  let error: string | undefined;

  if (eventsResult.status === "fulfilled") {
    events = eventsResult.value.events;
  } else {
    error = errorMessage(eventsResult.reason);
  }

  let states: string[] = [];
  if (statesResult.status === "fulfilled") {
    states = statesResult.value.states;
  } else if (!error) {
    error = errorMessage(statesResult.reason);
  }

  return {
    apiBaseUrl,
    events,
    states,
    error,
  };
}
