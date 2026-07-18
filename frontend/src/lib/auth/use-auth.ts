"use client";

import { useCallback, useEffect, useState } from "react";

import type { UserResponse } from "@/types/api";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: UserResponse }
  | { status: "unauthenticated" };

export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setState({ status: "unauthenticated" });
        return;
      }

      const data = (await response.json()) as { user: UserResponse };
      setState({ status: "authenticated", user: data.user });
    } catch {
      setState({ status: "unauthenticated" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    ...state,
    isAuthenticated: state.status === "authenticated",
    isLoading: state.status === "loading",
    refresh,
  };
}

export async function logoutClient(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
