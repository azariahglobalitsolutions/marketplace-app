import { createApiEndpoints } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/request";

export type BrowserApiClientOptions = {
  /**
   * Supplies the JWT for authenticated routes. Typically reads from client-side
   * auth state (e.g. memory or localStorage). Never pass backend secrets here.
   */
  getAccessToken?: () => string | null | undefined;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

/**
 * Browser-side API client for Client Components and client hooks.
 * Attaches Bearer tokens via {@link BrowserApiClientOptions.getAccessToken}.
 */
export function createBrowserApiClient(options: BrowserApiClientOptions = {}) {
  const request = <T>(
    path: string,
    init: Parameters<typeof apiRequest<T>>[1] = {},
  ) =>
    apiRequest<T>(path, {
      ...init,
      accessToken: options.getAccessToken?.() ?? null,
      baseUrl: options.baseUrl,
      fetchImpl: options.fetchImpl,
    });

  return createApiEndpoints(request);
}

export type BrowserApiClient = ReturnType<typeof createBrowserApiClient>;
