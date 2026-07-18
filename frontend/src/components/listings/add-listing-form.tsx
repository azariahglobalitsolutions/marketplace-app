"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/use-auth";
import {
  addListingDefaultValues,
  addListingFormSchema,
  type AddListingFormValues,
} from "@/lib/listings/add-listing-schema";
import { submitAddListing } from "@/lib/listings/submit-add-listing";
import { getDirectorySectionByCategory } from "@/lib/directory/sections";
import type { CategoryOption } from "@/types/api";
import { cn } from "@/lib/utils";

type AddListingFormProps = {
  states: string[];
  categories: CategoryOption[];
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

export function AddListingForm({
  states,
  categories,
  className,
}: AddListingFormProps) {
  const [success, setSuccess] = useState<{
    title: string;
    listingId: number;
    message: string;
    category: string;
  } | null>(null);
  const { isAuthenticated } = useAuth();

  const directoryCategories = categories.filter(
    (category) => category.id !== "events",
  );

  const form = useForm<AddListingFormValues>({
    resolver: zodResolver(addListingFormSchema),
    defaultValues: addListingDefaultValues,
    mode: "onBlur",
  });

  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: AddListingFormValues) {
    clearErrors();
    const result = await submitAddListing(values);

    if (result.ok) {
      setSuccess({
        title: result.response.listing.title,
        listingId: result.response.listing.id,
        message: result.response.message,
        category: result.response.listing.category,
      });
      reset(addListingDefaultValues);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    for (const [field, message] of Object.entries(result.fieldErrors)) {
      if (field === "_form") {
        setError("root", { message });
        continue;
      }

      setError(field as keyof AddListingFormValues, { message });
    }
  }

  if (success) {
    const section = getDirectorySectionByCategory(success.category);

    return (
      <Card className={cn("border-primary/20 bg-primary/5", className)}>
        <CardHeader>
          <CardTitle className="text-h2">Listing submitted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-body">{success.message}</p>
          <p className="text-body-sm text-muted-foreground">
            <strong className="text-foreground">{success.title}</strong> was
            saved to the backend and is pending admin approval.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {section ? (
              <Button render={<Link href={section.path} />}>Browse directory</Button>
            ) : null}
            <Button
              variant="outline"
              onClick={() => setSuccess(null)}
            >
              Submit another listing
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
        title="Add a listing"
        description="Submit a restaurant, health, education, or community listing. Fields map directly to POST /api/listings."
        className="mb-0"
      />

      {!isAuthenticated ? (
        <div
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
          role="status"
        >
          <p className="font-medium text-foreground">Sign in required</p>
          <p className="mt-1 text-muted-foreground">
            Listings are saved through the authenticated listings API.{" "}
            <Link href="/login?next=/add-listing" className="text-primary hover:underline">
              Sign in
            </Link>{" "}
            before submitting.
          </p>
        </div>
      ) : null}

      <div
        className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
        data-dev-notice="add-listing-unsupported-fields"
      >
        <p className="font-medium text-foreground">API-supported fields only</p>
        <p className="mt-1">
          Subcategory, website, ZIP code, and languages are not part of the
          current backend DTO. Address is stored as <code>venue</code>; optional
          hours use <code>start_time</code> and <code>end_time</code>.
        </p>
      </div>

      {errors.root?.message ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {errors.root.message}
        </p>
      ) : null}

      <section aria-labelledby="listing-basics-heading" className="space-y-5">
        <h2 id="listing-basics-heading" className="text-h3">
          Listing details
        </h2>

        <div className="space-y-2">
          <Label htmlFor="title">Listing name</Label>
          <Input
            id="title"
            autoComplete="organization"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            {...register("title")}
          />
          <FieldError id="title-error" message={errors.title?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Primary category</Label>
          <select
            id="category"
            className={fieldClassName}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? "category-error" : undefined}
            {...register("category")}
          >
            {directoryCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          <FieldError id="category-error" message={errors.category?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            className={textareaClassName}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? "description-error" : undefined}
            {...register("description")}
          />
          <FieldError
            id="description-error"
            message={errors.description?.message}
          />
        </div>
      </section>

      <section aria-labelledby="listing-contact-heading" className="space-y-5">
        <h2 id="listing-contact-heading" className="text-h3">
          Contact
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Email</Label>
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
            <Label htmlFor="contact_phone">Phone</Label>
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

      <section aria-labelledby="listing-location-heading" className="space-y-5">
        <h2 id="listing-location-heading" className="text-h3">
          Location
        </h2>

        <div className="space-y-2">
          <Label htmlFor="venue">Address or venue name</Label>
          <Input
            id="venue"
            autoComplete="street-address"
            aria-invalid={Boolean(errors.venue)}
            aria-describedby="venue-help venue-error"
            {...register("venue")}
          />
          <p id="venue-help" className="text-caption text-muted-foreground">
            Stored as <code>venue</code> in the API. Street-level address and ZIP
            are not separate backend fields yet.
          </p>
          <FieldError id="venue-error" message={errors.venue?.message} />
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

      <section aria-labelledby="listing-hours-heading" className="space-y-5">
        <h2 id="listing-hours-heading" className="text-h3">
          Business hours
        </h2>
        <p className="text-body-sm text-muted-foreground">
          Optional. Saved as <code>start_time</code> and <code>end_time</code> on
          the listing record.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_time">Opens</Label>
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
            <Label htmlFor="end_time">Closes</Label>
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

      <section aria-labelledby="listing-media-heading" className="space-y-5">
        <h2 id="listing-media-heading" className="text-h3">
          Image
        </h2>
        <p className="text-body-sm text-muted-foreground">
          Optional. Uploaded as multipart <code>picture</code> when provided (JPG,
          PNG, GIF, or WebP, max 5 MB).
        </p>

        <Controller
          control={control}
          name="picture"
          render={({ field: { onChange, ref, name, onBlur } }) => (
            <div className="space-y-2">
              <Label htmlFor="picture">Listing image</Label>
              <Input
                id="picture"
                ref={ref}
                name={name}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onBlur={onBlur}
                aria-invalid={Boolean(errors.picture)}
                aria-describedby={errors.picture ? "picture-error" : undefined}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  onChange(file ?? undefined);
                }}
              />
              <FieldError id="picture-error" message={errors.picture?.message} />
            </div>
          )}
        />
      </section>

      <section aria-labelledby="listing-terms-heading" className="space-y-3">
        <h2 id="listing-terms-heading" className="text-h3">
          Terms
        </h2>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-input"
            aria-invalid={Boolean(errors.acceptTerms)}
            aria-describedby={errors.acceptTerms ? "terms-error" : undefined}
            {...register("acceptTerms")}
          />
          <span>
            I confirm this listing is accurate, I have permission to publish it,
            and I understand submissions are reviewed before going live.
          </span>
        </label>
        <FieldError id="terms-error" message={errors.acceptTerms?.message} />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || !isAuthenticated}
        >
          {isSubmitting ? "Submitting…" : "Submit listing"}
        </Button>
        <p className="text-caption text-muted-foreground">
          Backend validation is authoritative. Duplicate clicks are ignored while
          submitting.
        </p>
      </div>
    </form>
  );
}
