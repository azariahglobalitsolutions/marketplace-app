import type { Metadata } from "next";

import { SubmitEventForm } from "@/components/events/submit-event-form";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState } from "@/components/patterns/error-state";
import { brand } from "@/lib/brand";
import { getSubmitEventPageData } from "@/lib/events/get-submit-event-page-data";

export const metadata: Metadata = {
  title: "Submit an Event",
  description:
    "Submit a Habesha community event for admin review through the live events API.",
  openGraph: {
    title: `Submit an Event | ${brand.name}`,
    description:
      "Share cultural events and community gatherings with the Habesha network.",
    type: "website",
  },
  alternates: {
    canonical: "/submit-event",
  },
};

export default async function SubmitEventPage() {
  const data = await getSubmitEventPageData();

  return (
    <PageContainer
      narrow
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Events & Activities", href: "/events" },
        { label: "Submit an Event" },
      ]}
    >
      {data.error ? (
        <ErrorState
          title="Unable to load form options"
          message={data.error}
          className="mb-6"
        />
      ) : null}
      <SubmitEventForm states={data.states} />
    </PageContainer>
  );
}
