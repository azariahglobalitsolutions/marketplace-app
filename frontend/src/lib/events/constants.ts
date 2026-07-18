/** Default page size for client-side pagination until the API supports page/limit. */
export const EVENTS_PAGE_SIZE = 12;

export const EVENT_FILTER_PARAMS = {
  state: "state",
  city: "city",
  date: "date",
  page: "page",
} as const;

export type EventTimeGroup = "today" | "tomorrow" | "this-weekend" | "upcoming";

export const EVENT_TIME_GROUPS: Array<{
  key: EventTimeGroup;
  label: string;
}> = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "this-weekend", label: "This Weekend" },
  { key: "upcoming", label: "Upcoming" },
];
