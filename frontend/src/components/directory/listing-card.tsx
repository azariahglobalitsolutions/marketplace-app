import Link from "next/link";
import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resolveMediaUrl } from "@/lib/api/media-url";
import type { DirectorySectionConfig } from "@/lib/directory/sections";
import type { ListingResponse } from "@/types/api";
import { cn } from "@/lib/utils";

type ListingCardProps = {
  listing: ListingResponse;
  apiBaseUrl: string;
  section: DirectorySectionConfig;
  href?: string;
  className?: string;
};

export function ListingCard({
  listing,
  apiBaseUrl,
  section,
  href,
  className,
}: ListingCardProps) {
  const imageUrl = resolveMediaUrl(listing.image_url, apiBaseUrl);
  const detailHref = href ?? `${section.path}/${listing.id}`;

  return (
    <Card
      className={cn(
        "h-full overflow-hidden transition-shadow hover:shadow-md",
        className,
      )}
    >
      {imageUrl ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{section.shortTitle}</Badge>
          {listing.status !== "approved" ? (
            <Badge variant="outline">{listing.status}</Badge>
          ) : null}
        </div>
        <CardTitle className="text-h3">
          <Link href={detailHref} className="hover:text-primary">
            {listing.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span>
            {listing.city}, {listing.state}
          </span>
        </CardDescription>
        {listing.venue ? (
          <p className="text-caption text-muted-foreground">{listing.venue}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {listing.description}
        </p>
      </CardContent>
    </Card>
  );
}
