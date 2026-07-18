import { resolveMediaUrl } from "@/lib/api/media-url";
import { formatEventAddress } from "@/lib/events/address";
import { buildListingCanonicalPath } from "@/lib/directory/slug";
import { serializeJsonLd } from "@/lib/seo/safe-json-ld";
import type { DirectorySectionConfig } from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";

type PostalAddressJsonLd = {
  "@type": "PostalAddress";
  addressLocality: string;
  addressRegion: string;
  addressCountry: "US";
};

export type LocalBusinessJsonLd = {
  "@context": "https://schema.org";
  "@type": "LocalBusiness" | "Restaurant";
  name: string;
  description: string;
  address?: PostalAddressJsonLd;
  image?: string[];
  url?: string;
  telephone?: string;
  email?: string;
};

export function buildListingJsonLd(options: {
  listing: ListingResponse;
  section: DirectorySectionConfig;
  apiBaseUrl: string;
  siteUrl: string;
}): LocalBusinessJsonLd | null {
  const { listing, section, apiBaseUrl, siteUrl } = options;

  if (!section.schemaType) {
    return null;
  }

  const address = formatEventAddress(listing);
  const imageUrl =
    resolveMediaUrl(listing.image_url, apiBaseUrl) ??
    resolveMediaUrl(listing.logo_url, apiBaseUrl);
  const canonicalUrl = new URL(
    buildListingCanonicalPath(section, listing.id),
    siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`,
  ).toString();

  const jsonLd: LocalBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": section.schemaType,
    name: listing.title,
    description: listing.description,
    url: canonicalUrl,
  };

  if (address.lines.length > 0) {
    jsonLd.address = {
      "@type": "PostalAddress",
      addressLocality: listing.city,
      addressRegion: listing.state,
      addressCountry: "US",
    };
  }

  if (imageUrl) {
    jsonLd.image = [imageUrl];
  }

  if (listing.contact_phone) {
    jsonLd.telephone = listing.contact_phone;
  }

  if (listing.contact_email) {
    jsonLd.email = listing.contact_email;
  }

  return jsonLd;
}

export function serializeListingJsonLd(jsonLd: LocalBusinessJsonLd): string {
  return serializeJsonLd(jsonLd);
}

export function buildListingMetadataDescription(
  listing: ListingResponse,
): string {
  const location = `${listing.city}, ${listing.state}`;
  return `${listing.title} in ${location}. ${listing.description}`.slice(0, 160);
}
