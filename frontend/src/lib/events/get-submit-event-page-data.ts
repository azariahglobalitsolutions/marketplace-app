import { createServerApiClient } from "@/lib/api/server";
import { isPublicApiBaseUrlConfigured } from "@/lib/config/env";

export type SubmitEventPageData = {
  states: string[];
  error?: string;
};

export async function getSubmitEventPageData(): Promise<SubmitEventPageData> {
  if (!isPublicApiBaseUrlConfigured()) {
    return {
      states: [],
      error: "NEXT_PUBLIC_API_BASE_URL is not configured.",
    };
  }

  const api = createServerApiClient();

  try {
    const response = await api.getListingStates();
    return { states: response.states };
  } catch (error) {
    return {
      states: [],
      error:
        error instanceof Error ? error.message : "Unable to load state options.",
    };
  }
}
