import { createBrowserApiClient } from "@/lib/api/browser";
import { isApiError } from "@/lib/api/errors";
import { getAccessToken } from "@/lib/auth/access-token";
import { mapEventApiErrorToFields } from "@/lib/events/submit-event-errors";
import {
  toCreateEventPayload,
  type SubmitEventFormValues,
} from "@/lib/events/submit-event-schema";
import type { CreateEventResponse } from "@/types/api";

export type SubmitEventResult =
  | {
      ok: true;
      response: CreateEventResponse;
    }
  | {
      ok: false;
      fieldErrors: Partial<Record<string, string>>;
      status?: number;
    };

export async function submitEvent(
  values: SubmitEventFormValues,
): Promise<SubmitEventResult> {
  const api = createBrowserApiClient({ getAccessToken });
  const payload = toCreateEventPayload(values);

  try {
    const response = await api.createEvent(payload);
    return { ok: true, response };
  } catch (error) {
    if (isApiError(error)) {
      return {
        ok: false,
        fieldErrors: mapEventApiErrorToFields(error.message, error.status),
        status: error.status,
      };
    }

    return {
      ok: false,
      fieldErrors: {
        _form: error instanceof Error ? error.message : "Unable to submit event.",
      },
    };
  }
}
