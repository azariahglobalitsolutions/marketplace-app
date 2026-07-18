import { createServerApiClient } from "@/lib/api/server";
import { isPublicApiBaseUrlConfigured } from "@/lib/config/env";
import {
  FEATURED_CATEGORIES,
  FEATURED_LISTINGS_LIMIT,
  UPCOMING_EVENTS_LIMIT,
} from "@/lib/home/constants";
import {
  filterListingsByKeyword,
  pickUpcomingEvents,
  selectFeaturedListings,
} from "@/lib/home/filters";
import type {
  CategoriesResponse,
  ListingResponse,
  StatesResponse,
} from "@/types/api";
import { isApiError } from "@/lib/api/errors";

export type HomepageData = {
  apiBaseUrl: string;
  events: ListingResponse[];
  categories: CategoriesResponse["categories"];
  states: string[];
  featuredListings: ListingResponse[];
  errors: Partial<Record<"events" | "categories" | "states" | "featured", string>>;
};

function errorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load data from the server.";
}

export async function getHomepageData(options: {
  state?: string;
  keyword?: string;
} = {}): Promise<HomepageData> {
  const empty: HomepageData = {
    apiBaseUrl: "",
    events: [],
    categories: [],
    states: [],
    featuredListings: [],
    errors: {},
  };

  if (!isPublicApiBaseUrlConfigured()) {
    return {
      ...empty,
      errors: {
        events: "NEXT_PUBLIC_API_BASE_URL is not configured.",
        categories: "NEXT_PUBLIC_API_BASE_URL is not configured.",
        states: "NEXT_PUBLIC_API_BASE_URL is not configured.",
        featured: "NEXT_PUBLIC_API_BASE_URL is not configured.",
      },
    };
  }

  const api = createServerApiClient();
  const errors: HomepageData["errors"] = {};

  const [eventsResult, categoriesResult, statesResult, ...featuredResults] =
    await Promise.allSettled([
      api.getEvents({ state: options.state }),
      api.getListingCategories(),
      api.getListingStates(),
      ...FEATURED_CATEGORIES.map((category) =>
        api.getListings({ category, state: options.state }),
      ),
    ]);

  let events: ListingResponse[] = [];
  if (eventsResult.status === "fulfilled") {
    events = filterListingsByKeyword(
      pickUpcomingEvents(eventsResult.value.events, UPCOMING_EVENTS_LIMIT * 2),
      options.keyword,
    ).slice(0, UPCOMING_EVENTS_LIMIT);
  } else {
    errors.events = errorMessage(eventsResult.reason);
  }

  let categories: CategoriesResponse["categories"] = [];
  if (categoriesResult.status === "fulfilled") {
    categories = categoriesResult.value.categories;
  } else {
    errors.categories = errorMessage(categoriesResult.reason);
  }

  let states: StatesResponse["states"] = [];
  if (statesResult.status === "fulfilled") {
    states = statesResult.value.states;
  } else {
    errors.states = errorMessage(statesResult.reason);
  }

  const featuredByCategory: ListingResponse[][] = [];

  for (const result of featuredResults) {
    if (result.status === "fulfilled") {
      featuredByCategory.push(result.value.listings);
    }
  }

  if (featuredResults.some((result) => result.status === "rejected")) {
    errors.featured = "Some featured categories could not be loaded.";
  }

  const featuredListings = selectFeaturedListings(
    featuredByCategory,
    FEATURED_LISTINGS_LIMIT,
  );

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(
    /\/+$/,
    "",
  ) ?? "";

  return {
    apiBaseUrl,
    events,
    categories,
    states,
    featuredListings,
    errors,
  };
}
