import { z } from "zod";

import type { CreateEventRequest } from "@/types/api";

export const EVENT_CATEGORY_LABEL = "Habesha Events & Activities";

function compareTimes(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotal = startHours * 60 + (startMinutes ?? 0);
  const endTotal = endHours * 60 + (endMinutes ?? 0);

  return endTotal - startTotal;
}

export const submitEventFormSchema = z
  .object({
    title: z.string().trim().min(1, "Event title is required"),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(5000, "Description must be 5,000 characters or fewer"),
    event_date: z.string().trim().min(1, "Start date is required"),
    end_date: z.string().trim().min(1, "End date is required"),
    start_time: z.string().trim().min(1, "Start time is required"),
    end_time: z.string().trim().min(1, "End time is required"),
    venue: z.string().trim().min(1, "Venue is required"),
    address: z.string().trim().optional(),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    contact_email: z
      .string()
      .trim()
      .min(1, "Contact email is required")
      .email("Enter a valid email address"),
    contact_phone: z.string().trim().min(7, "Enter a valid phone number"),
    contact_phone_country: z
      .string()
      .trim()
      .min(2, "Country code is required"),
    acceptReview: z.boolean().refine((value) => value, {
      message: "Confirm that you understand events are reviewed before publishing",
    }),
  })
  .superRefine((values, context) => {
    if (values.event_date && values.end_date && values.event_date !== values.end_date) {
      context.addIssue({
        code: "custom",
        path: ["end_date"],
        message:
          "Multi-day events are not supported yet. End date must match the start date.",
      });
    }

    if (values.start_time && values.end_time) {
      if (compareTimes(values.start_time, values.end_time) <= 0) {
        context.addIssue({
          code: "custom",
          path: ["end_time"],
          message: "End time must be after start time",
        });
      }
    }
  });

export type SubmitEventFormValues = z.infer<typeof submitEventFormSchema>;

export const submitEventDefaultValues: SubmitEventFormValues = {
  title: "",
  description: "",
  event_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  venue: "",
  address: "",
  city: "",
  state: "",
  contact_email: "",
  contact_phone: "",
  contact_phone_country: "US",
  acceptReview: false,
};

function buildVenue(values: Pick<SubmitEventFormValues, "venue" | "address">): string {
  const venue = values.venue.trim();
  const address = values.address?.trim();

  if (address) {
    return `${venue}, ${address}`;
  }

  return venue;
}

export function toCreateEventPayload(
  values: SubmitEventFormValues,
): CreateEventRequest {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    state: values.state.trim(),
    city: values.city.trim(),
    venue: buildVenue(values),
    event_date: values.event_date.trim(),
    start_time: values.start_time.trim(),
    end_time: values.end_time.trim(),
    contact_email: values.contact_email.trim(),
    contact_phone: values.contact_phone.trim(),
    contact_phone_country: values.contact_phone_country.trim(),
  };
}
