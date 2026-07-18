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
