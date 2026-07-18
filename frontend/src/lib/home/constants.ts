import type { ListingCategory } from "@/types/api";
import { DIRECTORY_SECTIONS } from "@/lib/directory/sections";

export const CATEGORY_ROUTES: Record<ListingCategory, string> = {
  events: "/events",
  restaurants: DIRECTORY_SECTIONS.restaurants.path,
  health: DIRECTORY_SECTIONS.health.path,
  education: DIRECTORY_SECTIONS.education.path,
  communities: DIRECTORY_SECTIONS.communities.path,
};

export const FEATURED_CATEGORIES: ListingCategory[] = [
  "restaurants",
  "health",
  "education",
  "communities",
];

/**
 * Navigation shortcuts to real US states served by the listings API.
 * Labels describe common Habesha community hubs; counts are not shown.
 */
export const POPULAR_REGIONS = [
  {
    label: "Washington, DC area",
    state: "Maryland",
    description: "Maryland & nearby Virginia listings",
  },
  {
    label: "Northern Virginia",
    state: "Virginia",
    description: "Arlington, Fairfax & surrounding cities",
  },
  {
    label: "Atlanta metro",
    state: "Georgia",
    description: "Georgia community & events",
  },
  {
    label: "Dallas–Fort Worth",
    state: "Texas",
    description: "North Texas Habesha network",
  },
  {
    label: "Twin Cities",
    state: "Minnesota",
    description: "Minneapolis–Saint Paul area",
  },
  {
    label: "Los Angeles",
    state: "California",
    description: "Southern California listings",
  },
] as const;

export const UPCOMING_EVENTS_LIMIT = 6;

export const FEATURED_LISTINGS_LIMIT = 6;
