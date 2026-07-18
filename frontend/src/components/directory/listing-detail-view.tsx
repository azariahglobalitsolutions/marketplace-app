import Link from "next/link";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { ListingDetailLayout } from "@/components/directory/listing-detail-layout";
import { RelatedListingsSection } from "@/components/directory/related-listings-section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { OptimizedImage } from "@/components/media/optimized-image";
import { resolveMediaUrl } from "@/lib/api/media-url";
import { formatEventAddress } from "@/lib/events/address";
import type { DirectorySectionConfig } from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";

type ListingDetailViewProps = {
  listing: ListingResponse;
  section: DirectorySectionConfig;
  relatedListings: ListingResponse[];
  apiBaseUrl: string;
  relatedError?: string;
};

function MissingField({ label }: { label: string }) {
  return (
    <p className="text-body-sm text-muted-foreground">
      {label} was not provided for this listing.
    </p>
  );
}

export function ListingDetailView({
  listing,
  section,
  relatedListings,
  apiBaseUrl,
  relatedError,
}: ListingDetailViewProps) {
  const imageUrl =
    resolveMediaUrl(listing.image_url, apiBaseUrl) ??
    resolveMediaUrl(listing.logo_url, apiBaseUrl);
  const address = formatEventAddress(listing);

  return (
    <ListingDetailLayout
      header={
        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{section.shortTitle}</Badge>
            {listing.status !== "approved" ? (
              <Badge variant="outline">{listing.status}</Badge>
            ) : null}
          </div>
          <h1 className="text-display">{listing.title}</h1>
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" aria-hidden />
            {listing.city}, {listing.state}
          </p>
        </header>
      }
      media={
        <section aria-labelledby="listing-image-heading">
          <h2 id="listing-image-heading" className="sr-only">
            Listing image
          </h2>
          {imageUrl ? (
            <div className="overflow-hidden rounded-2xl border border-border bg-muted">
              <OptimizedImage
                src={imageUrl}
                alt={`${listing.title} photo`}
                width={1200}
                height={900}
                className="max-h-[36rem] w-full object-contain"
              />
            </div>
          ) : (
            <MissingField label="A listing image" />
          )}
        </section>
      }
      main={
        <section
          aria-labelledby="listing-description-heading"
          className="space-y-3"
        >
          <h2 id="listing-description-heading" className="text-h2">
            About
          </h2>
          <p className="text-body whitespace-pre-wrap">{listing.description}</p>
        </section>
      }
      sidebar={
        <>
          <section
            aria-labelledby="listing-location-heading"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <h2 id="listing-location-heading" className="text-h3 mb-4">
              Location
            </h2>
            <div className="space-y-3 text-sm">
              {listing.venue ? (
                <p className="inline-flex items-start gap-2 font-medium text-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {listing.venue}
                </p>
              ) : (
                <MissingField label="A venue" />
              )}
              {address.lines.length > 0 ? (
                <p className="text-muted-foreground">{address.singleLine}</p>
              ) : null}
              <p className="text-caption text-muted-foreground">
                Street address is not included in the current listing API
                response.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="listing-contact-heading"
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <h2 id="listing-contact-heading" className="text-h3 mb-4">
              Contact
            </h2>
            {listing.contact_email || listing.contact_phone ? (
              <div className="space-y-2 text-sm">
                {listing.contact_email ? (
                  <a
                    href={`mailto:${listing.contact_email}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="size-4" aria-hidden />
                    {listing.contact_email}
                  </a>
                ) : null}
                {listing.contact_phone ? (
                  <a
                    href={`tel:${listing.contact_phone_tel ?? listing.contact_phone}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="size-4" aria-hidden />
                    {listing.contact_phone}
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <MissingField label="Contact information" />
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "soft", size: "sm" })}
                >
                  Sign in to view contact details
                </Link>
              </div>
            )}
          </section>

          {listing.attachment_url ? (
            <section
              aria-labelledby="listing-attachment-heading"
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <h2 id="listing-attachment-heading" className="text-h3 mb-4">
                Attachment
              </h2>
              <a
                href={resolveMediaUrl(listing.attachment_url, apiBaseUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="size-4" aria-hidden />
                View attachment
                {listing.attachment_name ? ` (${listing.attachment_name})` : ""}
              </a>
            </section>
          ) : null}
        </>
      }
      related={
        <RelatedListingsSection
          section={section}
          listings={relatedListings}
          apiBaseUrl={apiBaseUrl}
          error={relatedError}
        />
      }
    />
  );
}
