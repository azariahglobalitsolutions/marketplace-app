/**
 * Client auth state is managed via httpOnly cookies and `/api/auth/me`.
 * Use {@link useAuth} in Client Components instead of reading tokens directly.
 */
export function getAccessToken(): string | null {
  return null;
}

export function setAccessToken(_token: string): void {
  // Tokens are stored in httpOnly cookies by /api/auth/login and /api/auth/register.
}

export function clearAccessToken(): void {
  // Use logoutClient() from use-auth.ts or POST /api/auth/logout.
}
