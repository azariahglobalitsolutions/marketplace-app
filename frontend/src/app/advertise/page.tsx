import type { Metadata } from "next";

import { AdvertiseInquiryForm } from "@/components/advertise/advertise-inquiry-form";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/layout/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/patterns/error-state";
import { getAdvertisePageData } from "@/lib/advertise/get-advertise-page-data";

export const metadata: Metadata = {
  title: "Advertise with us",
  description: "Promote your business or event to the Habesha community on Wube Bereha.",
};

export default async function AdvertisePage() {
  const { tiers, error } = await getAdvertisePageData();

  return (
    <PageContainer>
      <SectionHeading
        as="h1"
        title="Advertise with Wube Bereha"
        description="Reach Habesha families and community members across the United States."
        className="mb-8"
      />

      {error ? (
        <ErrorState title="Unable to load pricing" message={error} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tiers.map((tier) => (
              <Card key={tier.id} className={tier.popular ? "border-primary" : undefined}>
                <CardHeader>
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <p className="text-2xl font-semibold">
                    {tier.price}
                    <span className="text-sm font-normal text-muted-foreground"> / {tier.period}</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {tier.features.map((feature) => (
                      <li key={feature}>• {feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <AdvertiseInquiryForm tiers={tiers} />
        </div>
      )}
    </PageContainer>
  );
}
