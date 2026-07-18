import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedImage } from "@/components/media/optimized-image";
import { resolveMediaUrl } from "@/lib/api/media-url";
import { formatListingDate, formatListingTime } from "@/lib/home/format";
import type { ListingResponse } from "@/types/api";
import { cn } from "@/lib/utils";

type EventListCardProps = {
  event: ListingResponse;
  apiBaseUrl: string;
  className?: string;
};

export function EventListCard({
  event,
  apiBaseUrl,
  className,
}: EventListCardProps) {
  const imageUrl = resolveMediaUrl(event.image_url, apiBaseUrl);
  const timeLabel = formatListingTime(event.start_time);
  const endTimeLabel = formatListingTime(event.end_time);

  return (
    <Card
      className={cn(
        "h-full overflow-hidden transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link href={`/events/${event.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] w-full bg-muted">
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No flyer uploaded
            </div>
          )}
        </div>
        <CardHeader className="gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Habesha Events</Badge>
          </div>
          <CardTitle className="text-h3 line-clamp-2">{event.title}</CardTitle>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden />
              {formatListingDate(event.event_date)}
            </p>
            {timeLabel ? (
              <p className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 shrink-0" aria-hidden />
                {timeLabel}
                {endTimeLabel ? ` – ${endTimeLabel}` : ""}
              </p>
            ) : null}
            <p className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <span>
                {event.city}, {event.state}
                {event.venue ? ` · ${event.venue}` : ""}
              </span>
            </p>
          </div>
        </CardHeader>
        <CardContent className="mt-auto">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}
