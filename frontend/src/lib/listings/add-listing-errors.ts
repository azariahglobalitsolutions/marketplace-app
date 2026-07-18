import type { FieldPath } from "react-hook-form";

import type { AddListingFormValues } from "@/lib/listings/add-listing-schema";

export type AddListingFieldName = FieldPath<AddListingFormValues> | "_form";

type FieldErrorMapping = {
  match: RegExp;
  fields: AddListingFieldName[];
};

const FIELD_ERROR_MAPPINGS: FieldErrorMapping[] = [
  {
    match: /title, description, state, and city are required/i,
    fields: ["title", "description", "state", "city"],
  },
  {
    match: /invalid category/i,
    fields: ["category"],
  },
  {
    match: /invalid us state/i,
    fields: ["state"],
  },
  {
    match: /file type/i,
    fields: ["picture"],
  },
  {
    match: /5 mb or smaller/i,
    fields: ["picture"],
  },
  {
    match: /authentication required/i,
    fields: ["_form"],
  },
];

export function mapListingApiErrorToFields(
  message: string,
): Partial<Record<AddListingFieldName, string>> {
  const normalized = message.trim();
  if (!normalized) {
    return { _form: "Unable to submit listing." };
  }

  for (const mapping of FIELD_ERROR_MAPPINGS) {
    if (mapping.match.test(normalized)) {
      return Object.fromEntries(
        mapping.fields.map((field) => [field, normalized]),
      ) as Partial<Record<AddListingFieldName, string>>;
    }
  }

  return { _form: normalized };
}
