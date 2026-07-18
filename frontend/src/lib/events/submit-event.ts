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
  const payload = toCreateEventPayload(values);

  const response = await fetch("/api/events", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    const message = body?.error ?? "Unable to submit event.";
    return {
      ok: false,
      fieldErrors: mapEventApiErrorToFields(message, response.status),
      status: response.status,
    };
  }

  const data = (await response.json()) as CreateEventResponse;
  return { ok: true, response: data };
}
