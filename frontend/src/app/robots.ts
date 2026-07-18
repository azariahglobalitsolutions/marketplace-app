import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/config/site";
import { DIRECTORY_SECTIONS } from "@/lib/directory/sections";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
