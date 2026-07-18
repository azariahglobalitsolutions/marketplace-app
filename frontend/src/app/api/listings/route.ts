import { NextResponse } from "next/server";

import { createServerApiClient } from "@/lib/api/server";
import { isApiError } from "@/lib/api/errors";
import { getServerAccessToken } from "@/lib/auth/session";
import type { CreateListingMultipartInput } from "@/types/api";

export async function POST(request: Request) {
  const token = await getServerAccessToken();

  if (!token) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const api = createServerApiClient({ accessToken: token });
    const form = await request.formData();
    const input: CreateListingMultipartInput = {
      category: String(form.get("category") ?? "") as CreateListingMultipartInput["category"],
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      state: String(form.get("state") ?? ""),
      city: String(form.get("city") ?? ""),
      venue: optionalString(form.get("venue")),
      event_date: optionalString(form.get("event_date")),
      start_time: optionalString(form.get("start_time")),
      end_time: optionalString(form.get("end_time")),
      contact_email: optionalString(form.get("contact_email")),
      contact_phone: optionalString(form.get("contact_phone")),
      contact_phone_country: optionalString(form.get("contact_phone_country")),
      picture: fileOrUndefined(form.get("picture")),
      logo: fileOrUndefined(form.get("logo")),
      attachment: fileOrUndefined(form.get("attachment")),
    };
    const response = await api.createListingMultipart(input);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Unable to submit listing." }, { status: 500 });
  }
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed || undefined;
}

function fileOrUndefined(value: FormDataEntryValue | null): File | undefined {
  return value instanceof File && value.size > 0 ? value : undefined;
}
