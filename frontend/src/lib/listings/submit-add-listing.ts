import {
  toCreateListingPayload,
  type AddListingFormValues,
} from "@/lib/listings/add-listing-schema";
import { mapListingApiErrorToFields } from "@/lib/listings/add-listing-errors";
import type { CreateListingResponse } from "@/types/api";

export type SubmitAddListingResult =
  | {
      ok: true;
      response: CreateListingResponse;
    }
  | {
      ok: false;
      fieldErrors: Partial<Record<string, string>>;
      status?: number;
    };

export async function submitAddListing(
  values: AddListingFormValues,
): Promise<SubmitAddListingResult> {
  const payload = toCreateListingPayload(values);
  const form = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (value instanceof File) {
      form.append(key, value);
    } else {
      form.append(key, String(value));
    }
  }

  const response = await fetch("/api/listings", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    const message = body?.error ?? "Unable to submit listing.";
    return {
      ok: false,
      fieldErrors: mapListingApiErrorToFields(message),
      status: response.status,
    };
  }

  const data = (await response.json()) as CreateListingResponse;
  return { ok: true, response: data };
}
