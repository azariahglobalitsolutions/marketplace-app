import { createBrowserApiClient } from "@/lib/api/browser";
import { isApiError } from "@/lib/api/errors";
import { getAccessToken } from "@/lib/auth/access-token";
import { mapListingApiErrorToFields } from "@/lib/listings/add-listing-errors";
import {
  toCreateListingPayload,
  type AddListingFormValues,
} from "@/lib/listings/add-listing-schema";
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
  const api = createBrowserApiClient({ getAccessToken });
  const payload = toCreateListingPayload(values);

  try {
    const response = payload.picture
      ? await api.createListingMultipart(payload)
      : await api.createListing(payload);

    return { ok: true, response };
  } catch (error) {
    if (isApiError(error)) {
      return {
        ok: false,
        fieldErrors: mapListingApiErrorToFields(error.message),
        status: error.status,
      };
    }

    return {
      ok: false,
      fieldErrors: {
        _form: error instanceof Error ? error.message : "Unable to submit listing.",
      },
    };
  }
}
