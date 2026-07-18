import "server-only";

import { createApiEndpoints } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/request";

export type ServerApiClientOptions = {
  /**
   * JWT for the current server request (e.g. from an httpOnly cookie or
   * session). Must be passed explicitly — this module never reads browser
   * storage and never uses private backend secrets.
   */
  accessToken?: string | null;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

/**
 * Server-side API client for Server Components, Route Handlers, and Server Actions.
 * Requires an explicit access token when calling authenticated endpoints.
 */
export function createServerApiClient(options: ServerApiClientOptions = {}) {
  const request = <T>(
    path: string,
    init: Parameters<typeof apiRequest<T>>[1] = {},
  ) =>
    apiRequest<T>(path, {
      ...init,
      accessToken: options.accessToken ?? null,
      baseUrl: options.baseUrl,
      fetchImpl: options.fetchImpl,
    });

  return createApiEndpoints(request);
}

export type ServerApiClient = ReturnType<typeof createServerApiClient>;
