const PUBLIC_API_BASE_URL_ENV = "NEXT_PUBLIC_API_BASE_URL";

/**
 * Returns the public backend base URL (no trailing slash).
 * Only exposes the public env var — never backend secrets such as JWT_SECRET.
 */
export function getPublicApiBaseUrl(): string {
  const value = process.env[PUBLIC_API_BASE_URL_ENV];

  if (value === undefined || value.trim() === "") {
    throw new Error(
      `${PUBLIC_API_BASE_URL_ENV} is not set. Copy frontend/.env.example to frontend/.env.local and set the backend URL.`,
    );
  }

  return value.trim().replace(/\/+$/, "");
}

export function isPublicApiBaseUrlConfigured(): boolean {
  const value = process.env[PUBLIC_API_BASE_URL_ENV];
  return value !== undefined && value.trim() !== "";
}
