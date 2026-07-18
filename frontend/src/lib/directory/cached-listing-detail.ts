import { cache } from "react";

import { getListingDetailData as fetchListingDetailData } from "@/lib/directory/get-listing-detail-data";
import type { DirectorySectionConfig } from "@/lib/directory/sections";

export const getCachedListingDetailData = cache(
  (section: DirectorySectionConfig, listingId: number) =>
    fetchListingDetailData(section, listingId),
);
