export { ApiError, isApiError, isErrorResponse } from "@/lib/api/errors";
export { apiRequest, buildQuery } from "@/lib/api/request";
export type { ApiBody, ApiRequestOptions } from "@/lib/api/request";
export { createApiEndpoints } from "@/lib/api/endpoints";
export type { ApiEndpoints, ApiRequestFn } from "@/lib/api/endpoints";
export { createBrowserApiClient } from "@/lib/api/browser";
export type { BrowserApiClient, BrowserApiClientOptions } from "@/lib/api/browser";

export {
  getPublicApiBaseUrl,
  isPublicApiBaseUrlConfigured,
} from "@/lib/config/env";
