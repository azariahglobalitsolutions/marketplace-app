import { NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api/server";
import { isApiError } from "@/lib/api/errors";
import { getServerAccessToken } from "@/lib/auth/session";

export async function GET() {
  const token = await getServerAccessToken();

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const api = createServerApiClient({ accessToken: token });
    const response = await api.getMe();
    return NextResponse.json(response);
  } catch (error) {
    if (isApiError(error) && error.status === 401) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to load session." }, { status: 500 });
  }
}
