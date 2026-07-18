"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PricingTier } from "@/types/api";

const inquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  tier: z.string().min(1, "Select a pricing tier"),
  message: z.string().optional(),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

type AdvertiseInquiryFormProps = {
  tiers: PricingTier[];
};

export function AdvertiseInquiryForm({ tiers }: AdvertiseInquiryFormProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      tier: tiers[0]?.id ?? "",
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/advertise/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setFormError(body?.error ?? "Unable to submit inquiry.");
        return;
      }

      const body = (await response.json()) as { message: string };
      setSuccessMessage(body.message);
      reset({ ...values, name: "", email: "", phone: "", message: "" });
    } catch {
      setFormError("Unable to submit inquiry.");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request advertising information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="tier">Pricing tier</Label>
            <select id="tier" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" {...register("tier")}>
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} — {tier.price}
                </option>
              ))}
            </select>
            {errors.tier ? <p className="text-sm text-destructive">{errors.tier.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} aria-invalid={Boolean(errors.name)} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} aria-invalid={Boolean(errors.email)} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" {...register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <textarea id="message" className="min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("message")} />
          </div>

          {formError ? <p className="text-sm text-destructive" role="alert">{formError}</p> : null}
          {successMessage ? <p className="text-sm text-primary" role="status">{successMessage}</p> : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Submit inquiry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
