"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAccessToken } from "@/lib/auth/access-token";
import {
  EVENT_CATEGORY_LABEL,
  submitEventDefaultValues,
  submitEventFormSchema,
  type SubmitEventFormValues,
} from "@/lib/events/submit-event-schema";
import { submitEvent } from "@/lib/events/submit-event";
import { cn } from "@/lib/utils";

type SubmitEventFormProps = {
  states: string[];
  className?: string;
};

const fieldClassName =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

const textareaClassName =
  "min-h-32 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-caption text-destructive" role="alert">
      {message}
    </p>
  );
}

export function SubmitEventForm({ states, className }: SubmitEventFormProps) {
  const [success, setSuccess] = useState<{
    title: string;
    eventId: number;
    message: string;
  } | null>(null);
  const [timezone] = useState(() =>
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : null,
  );
  const isAuthenticated = Boolean(getAccessToken());

  const form = useForm<SubmitEventFormValues>({
    resolver: zodResolver(submitEventFormSchema),
    defaultValues: submitEventDefaultValues,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: SubmitEventFormValues) {
    clearErrors();
    const result = await submitEvent(values);

    if (result.ok) {
      setSuccess({
        title: result.response.event.title,
        eventId: result.response.event.id,
        message: result.response.message,
      });
      reset(submitEventDefaultValues);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    for (const [field, message] of Object.entries(result.fieldErrors)) {
      if (field === "_form") {
        setError("root", { message });
        continue;
      }

      setError(field as keyof SubmitEventFormValues, { message });
    }
  }

  if (success) {
    return (
      <Card className={cn("border-primary/20 bg-primary/5", className)}>
        <CardHeader>
          <CardTitle className="text-h2">Event submitted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-body">{success.message}</p>
          <p className="text-body-sm text-muted-foreground">
            <strong className="text-foreground">{success.title}</strong> was saved
            to the backend and is pending admin review before it appears on the
            events page.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button render={<Link href="/events" />}>Browse events</Button>
            <Button
              variant="outline"
              render={<Link href={`/events/${success.eventId}`} />}
            >
              View submitted event
            </Button>
            <Button variant="outline" onClick={() => setSuccess(null)}>
              Submit another event
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-8", className)}
      aria-busy={isSubmitting}
    >
      <SectionHeading
        as="h1"
        title="Submit an event"
        description="Create a Habesha community event through POST /api/events. Submitted events are reviewed before they go live."
        className="mb-0"
      />

      <div
        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
        role="status"
      >
        <p className="font-medium text-foreground">Review required</p>
        <p className="mt-1 text-muted-foreground">
          All submitted events are saved with <code>pending</code> status and
          require admin approval before they appear publicly.
        </p>
      </div>

      {!isAuthenticated ? (
        <div
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
          role="status"
        >
          <p className="font-medium text-foreground">Sign in required</p>
          <p className="mt-1 text-muted-foreground">
            Event submissions require authentication.{" "}
            <Link
              href="/login?next=/submit-event"
              className="text-primary hover:underline"
            >
              Sign in
            </Link>{" "}
            before submitting.
          </p>
        </div>
      ) : null}

      <div
        className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
        data-dev-notice="submit-event-unsupported-fields"
      >
        <p className="font-medium text-foreground">API-supported fields only</p>
        <p className="mt-1">
          Ticket URL, free/paid pricing, ZIP code, event images, and separate
          organizer fields are not part of <code>POST /api/events</code> today.
          The authenticated account is the organizer. Address is combined into{" "}
          <code>venue</code>. Times are stored without a timezone field.
        </p>
      </div>

      {errors.root?.message ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {errors.root.message}
        </p>
      ) : null}

      <section aria-labelledby="event-basics-heading" className="space-y-5">
        <h2 id="event-basics-heading" className="text-h3">
          Event details
        </h2>

        <div className="space-y-2">
          <Label htmlFor="title">Event title</Label>
          <Input
            id="title"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            {...register("title")}
          />
          <FieldError id="title-error" message={errors.title?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="event-category">Event category</Label>
          <Input
            id="event-category"
            value={EVENT_CATEGORY_LABEL}
            readOnly
            disabled
            aria-readonly="true"
          />
          <p className="text-caption text-muted-foreground">
            Events are always saved with category <code>events</code>.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            className={textareaClassName}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
            {...register("description")}
          />
          <FieldError
            id="description-error"
            message={errors.description?.message}
          />
        </div>
      </section>

      <section aria-labelledby="event-schedule-heading" className="space-y-5">
        <h2 id="event-schedule-heading" className="text-h3">
          Schedule
        </h2>

        {timezone ? (
          <p className="text-body-sm text-muted-foreground">
            Your browser timezone is <strong>{timezone}</strong>. The API stores
            date and time strings without a separate timezone field.
          </p>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="event_date">Start date</Label>
            <Input
              id="event_date"
              type="date"
              aria-invalid={Boolean(errors.event_date)}
              aria-describedby={
                errors.event_date ? "event-date-error" : undefined
              }
              {...register("event_date", {
                onChange: (event) => {
                  const nextDate = event.target.value;
                  if (nextDate) {
                    setValue("end_date", nextDate, { shouldValidate: true });
                  }
                },
              })}
            />
            <FieldError
              id="event-date-error"
              message={errors.event_date?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End date</Label>
            <Input
              id="end_date"
              type="date"
              aria-invalid={Boolean(errors.end_date)}
              aria-describedby={errors.end_date ? "end-date-error" : undefined}
              {...register("end_date")}
            />
            <FieldError id="end-date-error" message={errors.end_date?.message} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_time">Start time</Label>
            <Input
              id="start_time"
              type="time"
              aria-invalid={Boolean(errors.start_time)}
              aria-describedby={
                errors.start_time ? "start-time-error" : undefined
              }
              {...register("start_time")}
            />
            <FieldError
              id="start-time-error"
              message={errors.start_time?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_time">End time</Label>
            <Input
              id="end_time"
              type="time"
              aria-invalid={Boolean(errors.end_time)}
              aria-describedby={errors.end_time ? "end-time-error" : undefined}
              {...register("end_time")}
            />
            <FieldError id="end-time-error" message={errors.end_time?.message} />
          </div>
        </div>
      </section>

      <section aria-labelledby="event-location-heading" className="space-y-5">
        <h2 id="event-location-heading" className="text-h3">
          Location
        </h2>

        <div className="space-y-2">
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            aria-invalid={Boolean(errors.venue)}
            aria-describedby={errors.venue ? "venue-error" : undefined}
            {...register("venue")}
          />
          <FieldError id="venue-error" message={errors.venue?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            autoComplete="street-address"
            aria-invalid={Boolean(errors.address)}
            aria-describedby="address-help address-error"
            {...register("address")}
          />
          <p id="address-help" className="text-caption text-muted-foreground">
            Combined with venue into the API <code>venue</code> field. ZIP code is
            not a separate backend field.
          </p>
          <FieldError id="address-error" message={errors.address?.message} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              autoComplete="address-level2"
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? "city-error" : undefined}
              {...register("city")}
            />
            <FieldError id="city-error" message={errors.city?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <select
              id="state"
              className={fieldClassName}
              autoComplete="address-level1"
              aria-invalid={Boolean(errors.state)}
              aria-describedby={errors.state ? "state-error" : undefined}
              {...register("state")}
            >
              <option value="">Select a state</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <FieldError id="state-error" message={errors.state?.message} />
          </div>
        </div>
      </section>

      <section aria-labelledby="event-contact-heading" className="space-y-5">
        <h2 id="event-contact-heading" className="text-h3">
          Organizer & contact
        </h2>

        <p className="text-body-sm text-muted-foreground">
          The signed-in account is recorded as the event organizer. Provide public
          contact details for attendees.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact email</Label>
            <Input
              id="contact_email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.contact_email)}
              aria-describedby={
                errors.contact_email ? "contact-email-error" : undefined
              }
              {...register("contact_email")}
            />
            <FieldError
              id="contact-email-error"
              message={errors.contact_email?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Contact phone</Label>
            <Input
              id="contact_phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(errors.contact_phone)}
              aria-describedby={
                errors.contact_phone ? "contact-phone-error" : undefined
              }
              {...register("contact_phone")}
            />
            <FieldError
              id="contact-phone-error"
              message={errors.contact_phone?.message}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone_country">Phone country</Label>
          <Input
            id="contact_phone_country"
            autoComplete="country"
            aria-invalid={Boolean(errors.contact_phone_country)}
            aria-describedby={
              errors.contact_phone_country
                ? "contact-phone-country-error"
                : undefined
            }
            {...register("contact_phone_country")}
          />
          <FieldError
            id="contact-phone-country-error"
            message={errors.contact_phone_country?.message}
          />
        </div>
      </section>

      <section aria-labelledby="event-review-heading" className="space-y-3">
        <h2 id="event-review-heading" className="text-h3">
          Review acknowledgment
        </h2>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-input"
            aria-invalid={Boolean(errors.acceptReview)}
            aria-describedby={
              errors.acceptReview ? "accept-review-error" : undefined
            }
            {...register("acceptReview")}
          />
          <span>
            I understand this event will be reviewed by admins before it is
            published publicly.
          </span>
        </label>
        <FieldError
          id="accept-review-error"
          message={errors.acceptReview?.message}
        />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || !isAuthenticated}
        >
          {isSubmitting ? "Submitting…" : "Submit event"}
        </Button>
        <p className="text-caption text-muted-foreground">
          Backend validation is authoritative. Duplicate submissions are blocked
          while the request is in flight.
        </p>
      </div>
    </form>
  );
}
