import { getPublicApiBaseUrl } from "@/lib/config/env";
import { ApiError, isErrorResponse } from "@/lib/api/errors";

export type ApiBody = unknown;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: ApiBody;
  accessToken?: string | null;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

function joinUrl(baseUrl: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

function buildHeaders(
  init: ApiRequestOptions,
  body: BodyInit | undefined,
): Headers {
  const headers = new Headers(init.headers);

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (init.accessToken) {
    headers.set("Authorization", `Bearer ${init.accessToken}`);
  }

  return headers;
}

function serializeBody(body: ApiBody | undefined): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    typeof body === "string" ||
    body instanceof Blob
  ) {
    return body;
  }

  return JSON.stringify(body);
}

async function parseErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }

  try {
    const text = await response.text();
    return text || undefined;
  } catch {
    return undefined;
  }
}

function messageFromErrorBody(body: unknown, status: number): string {
  if (isErrorResponse(body)) {
    return body.error;
  }

  if (typeof body === "string" && body.trim() !== "") {
    return body;
  }

  return `Request failed with status ${status}`;
}

/**
 * Shared JSON-oriented fetch wrapper for the Wube Bereha backend.
 * Throws {@link ApiError} for non-2xx responses.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const baseUrl = options.baseUrl ?? getPublicApiBaseUrl();
  const fetchImpl = options.fetchImpl ?? fetch;
  const body = serializeBody(options.body);
  const headers = buildHeaders(options, body);

  const response = await fetchImpl(joinUrl(baseUrl, path), {
    method: options.method,
    cache: options.cache,
    credentials: options.credentials,
    integrity: options.integrity,
    keepalive: options.keepalive,
    mode: options.mode,
    priority: options.priority,
    redirect: options.redirect,
    referrer: options.referrer,
    referrerPolicy: options.referrerPolicy,
    signal: options.signal,
    window: options.window,
    headers,
    body,
  });

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);
    throw new ApiError(
      messageFromErrorBody(errorBody, response.status),
      response.status,
      errorBody,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export function buildQuery(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}
