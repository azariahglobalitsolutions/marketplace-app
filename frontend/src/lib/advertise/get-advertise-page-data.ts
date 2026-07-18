import { createServerApiClient } from "@/lib/api/server";
import { getPublicApiBaseUrl, isPublicApiBaseUrlConfigured } from "@/lib/config/env";
import type { PricingTier } from "@/types/api";

export type AdvertisePageData = {
  tiers: PricingTier[];
  error?: string;
};

export async function getAdvertisePageData(): Promise<AdvertisePageData> {
  if (!isPublicApiBaseUrlConfigured()) {
    return {
      tiers: [],
      error: "NEXT_PUBLIC_API_BASE_URL is not configured.",
    };
  }

  const api = createServerApiClient({ baseUrl: getPublicApiBaseUrl() });

  try {
    const response = await api.getAdvertiseTiers();
    return { tiers: response.tiers as PricingTier[] };
  } catch (error) {
    return {
      tiers: [],
      error: error instanceof Error ? error.message : "Unable to load pricing tiers.",
    };
  }
}
