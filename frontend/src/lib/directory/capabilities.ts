/**
 * Backend capabilities for directory listing pages.
 * @see docs/API_CONTRACT.md
 */
export const DIRECTORY_API_CAPABILITIES = {
  supported: {
    listByCategory: {
      endpoint: "GET /api/listings?category={category}",
      description: "Returns approved listings for a category.",
    },
    filterByState: {
      endpoint: "GET /api/listings?category={category}&state={state}",
      description: "State filter is sent to the backend.",
    },
    statesList: {
      endpoint: "GET /api/listings/states",
      description: "US state options for location filters.",
    },
    categoriesList: {
      endpoint: "GET /api/listings/categories",
      description: "Category metadata for navigation labels.",
    },
    listingDetail: {
      endpoint: "GET /api/listings/{listingId}",
      description: "Single listing detail for future detail pages.",
    },
  },
  missing: {
    serverPagination: {
      reason: "No page, limit, or offset query parameters on GET /api/listings.",
      frontendBehavior: "Client-side pagination over the full API response.",
    },
    serverCityFilter: {
      reason: "No city query parameter on GET /api/listings.",
      frontendBehavior: "Client-side city filter over the state-scoped API response.",
    },
    keywordSearch: {
      reason: "No search query parameter on GET /api/listings.",
      frontendBehavior: "Not implemented on directory pages.",
    },
    subcategoryFilter: {
      reason: "Listings only expose top-level category values.",
      frontendBehavior: "Category filter navigates between directory sections.",
    },
    ratingOrReviews: {
      reason: "Listing DTO has no rating or review fields.",
      frontendBehavior: "Not displayed.",
    },
    hoursOrPricing: {
      reason: "Listing DTO has no hours or pricing fields.",
      frontendBehavior: "Not displayed.",
    },
  },
} as const;

export const DIRECTORY_CLIENT_FILTER_NOTICE =
  "City and page filters run in the browser. Only the state filter is sent to GET /api/listings today.";
