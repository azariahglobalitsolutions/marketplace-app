import { NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api/server";
import { isApiError } from "@/lib/api/errors";
import { getServerAccessToken } from "@/lib/auth/session";
import type { CreateEventRequest } from "@/types/api";

export async function POST(request: Request) {
  const token = await getServerAccessToken();

  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreateEventRequest;
    const api = createServerApiClient({ accessToken: token });
    const response = await api.createEvent(body);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Unable to submit event." }, { status: 500 });
  }
}
