import type { Metadata } from "next";

import { AddListingForm } from "@/components/listings/add-listing-form";
import { PageContainer } from "@/components/layout/page-container";
import { ErrorState } from "@/components/patterns/error-state";
import { brand } from "@/lib/brand";
import { getAddListingPageData } from "@/lib/listings/get-add-listing-page-data";

export const metadata: Metadata = {
  title: "Add a Listing",
  description:
    "Submit a restaurant, health, education, or community listing to the Wube Bereha directory.",
  openGraph: {
    title: `Add a Listing | ${brand.name}`,
    description:
      "Submit a listing for admin review using the live listings API.",
    type: "website",
  },
  alternates: {
    canonical: "/add-listing",
  },
};

export default async function AddListingPage() {
  const data = await getAddListingPageData();

  return (
    <PageContainer
      narrow
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Add a Listing" },
      ]}
    >
      {data.error ? (
        <ErrorState
          title="Unable to load form options"
          message={data.error}
          className="mb-6"
        />
      ) : null}
      <AddListingForm states={data.states} categories={data.categories} />
    </PageContainer>
  );
}
