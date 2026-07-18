export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export const primaryNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Events & Activities",
    href: "/events",
    description: "Cultural events and community gatherings",
  },
  {
    label: "Restaurants, Coffee & Lounges",
    href: "/restaurants",
    description: "Dining, coffee ceremonies, and lounges",
  },
  {
    label: "Health & Wellness",
    href: "/health",
    description: "Clinics, counseling, and wellness providers",
  },
  {
    label: "Education & Training",
    href: "/education",
    description: "Language schools, tutoring, and training",
  },
  {
    label: "Communities & Networking",
    href: "/communities",
    description: "Professional networks and community groups",
  },
];

export const actionNavigation: NavItem[] = [
  { label: "Add a Listing", href: "/listings/new" },
  { label: "Submit an Event", href: "/events/new" },
];

export const footerNavigation: NavItem[] = [
  { label: "Advertise With Us", href: "/advertise" },
  { label: "Sign In", href: "/login" },
];
