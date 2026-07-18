/** Default page size until GET /api/listings supports pagination. */
export const DIRECTORY_PAGE_SIZE = 12;

export const DIRECTORY_FILTER_PARAMS = {
  state: "state",
  city: "city",
  page: "page",
} as const;
