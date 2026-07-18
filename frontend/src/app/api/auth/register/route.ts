import { NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api/server";
import { isApiError } from "@/lib/api/errors";
import { setServerAccessToken } from "@/lib/auth/session";
import type { AuthRequest } from "@/types/api";

export async function POST(request: Request) {
  const body = (await request.json()) as AuthRequest;

  try {
    const api = createServerApiClient();
    const response = await api.register(body);
    await setServerAccessToken(response.token);
    return NextResponse.json({ user: response.user }, { status: 201 });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
