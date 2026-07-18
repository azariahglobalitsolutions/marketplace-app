import type { FieldPath } from "react-hook-form";

import type { SubmitEventFormValues } from "@/lib/events/submit-event-schema";

export type SubmitEventFieldName = FieldPath<SubmitEventFormValues> | "_form";

type FieldErrorMapping = {
  match: RegExp;
  fields: SubmitEventFieldName[];
};

const FIELD_ERROR_MAPPINGS: FieldErrorMapping[] = [
  {
    match: /title, description, state, and city are required/i,
    fields: ["title", "description", "state", "city"],
  },
  {
    match: /event date is required/i,
    fields: ["event_date"],
  },
  {
    match: /invalid us state/i,
    fields: ["state"],
  },
  {
    match: /authentication required/i,
    fields: ["_form"],
  },
  {
    match: /duplicate|already exists|conflict/i,
    fields: ["_form", "title"],
  },
];

export function mapEventApiErrorToFields(
  message: string,
  status?: number,
): Partial<Record<SubmitEventFieldName, string>> {
  const normalized = message.trim();

  if (status === 409) {
    const duplicateMessage =
      normalized || "An event with these details may already exist.";
    return {
      _form: duplicateMessage,
      title: duplicateMessage,
    };
  }

  if (!normalized) {
    return { _form: "Unable to submit event." };
  }

  for (const mapping of FIELD_ERROR_MAPPINGS) {
    if (mapping.match.test(normalized)) {
      return Object.fromEntries(
        mapping.fields.map((field) => [field, normalized]),
      ) as Partial<Record<SubmitEventFieldName, string>>;
    }
  }

  return { _form: normalized };
}
