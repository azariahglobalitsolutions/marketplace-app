import type { ListingCategory } from "@/types/api";

/** Filters exposed in the directory UI for a section. */
export type DirectoryFilterSupport = {
  /** Sent to GET /api/listings?state= */
  state: boolean;
  /** Client-side only — not supported by the listings API. */
  city: boolean;
  /** Client-side only — not supported by the listings API. */
  pagination: boolean;
  /** Show directory section switcher in filters. */
  categoryNavigation: boolean;
};

export const BACKEND_ONLY_DIRECTORY_FILTERS: DirectoryFilterSupport = {
  state: true,
  city: false,
  pagination: false,
  categoryNavigation: true,
};

export const FULL_DIRECTORY_FILTERS: DirectoryFilterSupport = {
  state: true,
  city: true,
  pagination: true,
  categoryNavigation: true,
};

/**
 * Directory section configuration for non-event listing categories.
 * Events use the dedicated /events route and are not part of this framework.
 */
export type DirectorySectionConfig = {
  category: Exclude<ListingCategory, "events">;
  path: `/${string}`;
  title: string;
  shortTitle: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  addListingLabel: string;
  filters: DirectoryFilterSupport;
  /** Schema.org type for JSON-LD on detail pages. */
  schemaType?: "Restaurant" | "LocalBusiness";
};

export const DIRECTORY_SECTIONS = {
  restaurants: {
    category: "restaurants",
    path: "/restaurants",
    title: "Restaurants, Coffee & Lounges",
    shortTitle: "Restaurants & Lounges",
    description:
      "Discover Ethiopian and Eritrean restaurants, coffee ceremonies, and lounges serving the Habesha community across the United States.",
    emptyTitle: "No restaurants found",
    emptyDescription:
      "There are no approved restaurant or lounge listings matching your filters right now.",
    addListingLabel: "Add a restaurant listing",
    filters: BACKEND_ONLY_DIRECTORY_FILTERS,
    schemaType: "Restaurant",
  },
  health: {
    category: "health",
    path: "/health",
    title: "Health & Wellness",
    shortTitle: "Health & Wellness",
    description:
      "Find clinics, counselors, and wellness providers serving the Habesha community nationwide.",
    emptyTitle: "No health listings found",
    emptyDescription:
      "There are no approved health and wellness listings matching your filters right now.",
    addListingLabel: "Add a health listing",
    filters: FULL_DIRECTORY_FILTERS,
    schemaType: "LocalBusiness",
  },
  education: {
    category: "education",
    path: "/education",
    title: "Education & Training",
    shortTitle: "Education & Training",
    description:
      "Explore language schools, tutoring programs, and professional training for the Habesha community.",
    emptyTitle: "No education listings found",
    emptyDescription:
      "There are no approved education and training listings matching your filters right now.",
    addListingLabel: "Add an education listing",
    filters: FULL_DIRECTORY_FILTERS,
    schemaType: "LocalBusiness",
  },
  communities: {
    category: "communities",
    path: "/communities",
    title: "Communities & Networking",
    shortTitle: "Communities & Networking",
    description:
      "Connect with professional networks, support groups, and community organizations across the USA.",
    emptyTitle: "No community listings found",
    emptyDescription:
      "There are no approved community listings matching your filters right now.",
    addListingLabel: "Add a community listing",
    filters: FULL_DIRECTORY_FILTERS,
    schemaType: "LocalBusiness",
  },
} as const satisfies Record<
  Exclude<ListingCategory, "events">,
  DirectorySectionConfig
>;

export type DirectorySectionKey = keyof typeof DIRECTORY_SECTIONS;

export const DIRECTORY_SECTION_LIST = Object.values(DIRECTORY_SECTIONS);

export function getDirectorySectionByCategory(
  category: string,
): DirectorySectionConfig | undefined {
  return DIRECTORY_SECTION_LIST.find((section) => section.category === category);
}

export function getDirectorySectionByPath(
  path: string,
): DirectorySectionConfig | undefined {
  return DIRECTORY_SECTION_LIST.find((section) => section.path === path);
}
