import { NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api/server";
import { isApiError } from "@/lib/api/errors";
import type { AdvertiseInquiryRequest } from "@/types/api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AdvertiseInquiryRequest;
    const api = createServerApiClient();
    const response = await api.submitAdvertiseInquiry(body);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Unable to submit inquiry." }, { status: 500 });
  }
}
