import Link from "next/link";
import { Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage } from "@/components/media/optimized-image";
import { resolveMediaUrl } from "@/lib/api/media-url";
import { formatListingDate, formatListingTime } from "@/lib/home/format";
import type { ListingResponse } from "@/types/api";

type EventCardProps = {
  event: ListingResponse;
  apiBaseUrl: string;
};

export function EventCard({ event, apiBaseUrl }: EventCardProps) {
  const imageUrl = resolveMediaUrl(event.image_url, apiBaseUrl);
  const timeLabel = formatListingTime(event.start_time);
  const endTimeLabel = formatListingTime(event.end_time);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
        <div className="flex shrink-0 items-center gap-3 sm:w-36 sm:flex-col sm:justify-center sm:rounded-lg sm:bg-muted/50 sm:px-3 sm:py-4">
          <div className="text-center">
            <p className="text-caption uppercase tracking-wide">Event</p>
            <p className="text-sm font-semibold text-primary">
              {formatListingDate(event.event_date)}
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <CardHeader className="gap-2 p-0">
            <CardTitle className="text-h3">
              <Link href={`/events/${event.id}`} className="hover:text-primary">
                {event.title}
              </Link>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {event.city}, {event.state}
              </span>
              {event.venue ? <span>· {event.venue}</span> : null}
            </div>
          </CardHeader>
          <CardContent className="mt-3 space-y-3 p-0">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {event.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {timeLabel ? (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="size-3" aria-hidden />
                  {timeLabel}
                  {endTimeLabel ? ` – ${endTimeLabel}` : ""}
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </div>

        {imageUrl ? (
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:aspect-square sm:w-28">
            <OptimizedImage
              src={imageUrl}
              alt=""
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
