import { z } from "zod";

import type { ListingCategory } from "@/types/api";

/** Directory listing categories accepted by POST /api/listings (events use /events/new). */
export const ADD_LISTING_CATEGORIES = [
  "restaurants",
  "health",
  "education",
  "communities",
] as const satisfies readonly ListingCategory[];

export type AddListingCategory = (typeof ADD_LISTING_CATEGORIES)[number];

const PICTURE_MAX_BYTES = 5 * 1024 * 1024;
const PICTURE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"] as const;

function pictureExtension(file: File): string | null {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) {
    return fromName;
  }

  const mime = file.type.split("/").pop()?.toLowerCase();
  if (mime === "jpeg") {
    return "jpg";
  }

  return mime ?? null;
}

export const addListingFormSchema = z
  .object({
    title: z.string().trim().min(1, "Listing name is required"),
    category: z.enum(ADD_LISTING_CATEGORIES, {
      message: "Select a primary category",
    }),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(5000, "Description must be 5,000 characters or fewer"),
    contact_email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    contact_phone: z.string().trim().min(7, "Enter a valid phone number"),
    contact_phone_country: z.string().trim().min(2, "Country code is required"),
    venue: z.string().trim().optional(),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    start_time: z.string().trim().optional(),
    end_time: z.string().trim().optional(),
    picture: z
      .custom<File | null | undefined>((value) => {
        if (value === undefined || value === null) {
          return true;
        }
        return value instanceof File;
      })
      .optional(),
    acceptTerms: z.boolean().refine((value) => value, {
      message: "You must accept the terms before submitting",
    }),
  })
  .superRefine((values, context) => {
    if (!values.picture) {
      return;
    }

    const extension = pictureExtension(values.picture);
    if (!extension || !PICTURE_EXTENSIONS.includes(extension as (typeof PICTURE_EXTENSIONS)[number])) {
      context.addIssue({
        code: "custom",
        path: ["picture"],
        message: "Image must be JPG, PNG, GIF, or WebP",
      });
    }

    if (values.picture.size > PICTURE_MAX_BYTES) {
      context.addIssue({
        code: "custom",
        path: ["picture"],
        message: "Image must be 5 MB or smaller",
      });
    }
  });

export type AddListingFormValues = z.infer<typeof addListingFormSchema>;

export const addListingDefaultValues: AddListingFormValues = {
  title: "",
  category: "restaurants",
  description: "",
  contact_email: "",
  contact_phone: "",
  contact_phone_country: "US",
  venue: "",
  city: "",
  state: "",
  start_time: "",
  end_time: "",
  picture: undefined,
  acceptTerms: false,
};

export function toCreateListingPayload(values: AddListingFormValues) {
  return {
    category: values.category,
    title: values.title.trim(),
    description: values.description.trim(),
    state: values.state.trim(),
    city: values.city.trim(),
    venue: values.venue?.trim() || undefined,
    contact_email: values.contact_email.trim(),
    contact_phone: values.contact_phone.trim(),
    contact_phone_country: values.contact_phone_country.trim(),
    start_time: values.start_time?.trim() || undefined,
    end_time: values.end_time?.trim() || undefined,
    picture: values.picture ?? undefined,
  };
}
