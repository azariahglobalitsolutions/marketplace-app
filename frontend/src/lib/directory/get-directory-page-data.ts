import { createServerApiClient } from "@/lib/api/server";
import { isApiError } from "@/lib/api/errors";
import { isPublicApiBaseUrlConfigured } from "@/lib/config/env";
import type { DirectorySectionConfig } from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";

export type DirectoryPageData = {
  apiBaseUrl: string;
  listings: ListingResponse[];
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

  return "Unable to load listings from the server.";
}

export async function getDirectoryPageData(
  section: DirectorySectionConfig,
  state?: string,
): Promise<DirectoryPageData> {
  if (!isPublicApiBaseUrlConfigured()) {
    return {
      apiBaseUrl: "",
      listings: [],
      states: [],
      error: "NEXT_PUBLIC_API_BASE_URL is not configured.",
    };
  }

  const api = createServerApiClient();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";

  const [listingsResult, statesResult] = await Promise.allSettled([
    api.getListings({ category: section.category, state }),
    api.getListingStates(),
  ]);

  let listings: ListingResponse[] = [];
  let error: string | undefined;

  if (listingsResult.status === "fulfilled") {
    listings = listingsResult.value.listings;
  } else {
    error = errorMessage(listingsResult.reason);
  }

  let states: string[] = [];
  if (statesResult.status === "fulfilled") {
    states = statesResult.value.states;
  } else if (!error) {
    error = errorMessage(statesResult.reason);
  }

  return {
    apiBaseUrl,
    listings,
    states,
    error,
  };
}
