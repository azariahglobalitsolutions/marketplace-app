import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/config/site";
import { DIRECTORY_SECTIONS } from "@/lib/directory/sections";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes = [
    "",
    "/events",
    "/restaurants",
    "/health-wellness",
    "/education-training",
    "/communities-networking",
    "/add-listing",
    "/submit-event",
    "/advertise",
    "/login",
    "/register",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
    })),
    ...Object.values(DIRECTORY_SECTIONS).map((section) => ({
      url: `${siteUrl}${section.path}`,
      lastModified: now,
    })),
  ];
}
