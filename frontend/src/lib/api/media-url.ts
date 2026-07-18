/**
 * Resolves backend-relative upload paths to absolute URLs for <img src>.
 */
export function resolveMediaUrl(
  path: string | null | undefined,
  apiBaseUrl: string,
): string | undefined {
  if (!path) {
    return undefined;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const base = apiBaseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
