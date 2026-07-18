/**
 * Temporary client-only behavior until matching backend endpoints exist.
 * @see docs/API_CONTRACT.md — Missing endpoints
 */

/** Keyword search is filtered in the browser; no GET /api/listings?search= yet. */
export const CLIENT_SIDE_KEYWORD_SEARCH = {
  enabled: true,
  notice:
    "Keyword search filters results on this page until the backend search API is available.",
} as const;

/** No newsletter subscription endpoint exists in the API contract. */
export const NEWSLETTER_SUBSCRIPTION_SUPPORTED = false;

/**
 * Events page filters applied in the browser because the API only supports `state`
 * on GET /api/events. Pagination is also client-side until page/limit exist.
 * @see docs/API_CONTRACT.md
 */
export const EVENTS_CLIENT_FILTERS = {
  city: true,
  date: true,
  pagination: true,
  notice:
    "City, date, and page filters run in the browser. Only the state filter is sent to GET /api/events today.",
} as const;

/** Listing DTOs do not include pricing or ticket type fields. */
export const EVENTS_PAID_FILTER_SUPPORTED = false;
