import { createServerApiClient } from "@/lib/api/server";
import { isPublicApiBaseUrlConfigured } from "@/lib/config/env";
import type { CategoryOption } from "@/types/api";

export type AddListingPageData = {
  states: string[];
  categories: CategoryOption[];
  error?: string;
};

export async function getAddListingPageData(): Promise<AddListingPageData> {
  if (!isPublicApiBaseUrlConfigured()) {
    return {
      states: [],
      categories: [],
      error: "NEXT_PUBLIC_API_BASE_URL is not configured.",
    };
  }

  const api = createServerApiClient();

  const [statesResult, categoriesResult] = await Promise.allSettled([
    api.getListingStates(),
    api.getListingCategories(),
  ]);

  let error: string | undefined;

  if (statesResult.status === "rejected") {
    error =
      statesResult.reason instanceof Error
        ? statesResult.reason.message
        : "Unable to load states.";
  }

  if (categoriesResult.status === "rejected") {
    error =
      categoriesResult.reason instanceof Error
        ? categoriesResult.reason.message
        : "Unable to load categories.";
  }

  return {
    states:
      statesResult.status === "fulfilled" ? statesResult.value.states : [],
    categories:
      categoriesResult.status === "fulfilled"
        ? categoriesResult.value.categories
        : [],
    error,
  };
}
