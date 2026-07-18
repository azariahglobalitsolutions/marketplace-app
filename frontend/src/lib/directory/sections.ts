import type { ListingCategory } from "@/types/api";

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
