import { AlertTriangle } from "lucide-react";

import { formatListingDate } from "@/lib/home/format";

type EventExpiredNoticeProps = {
  eventDate?: string | null;
};

export function EventExpiredNotice({ eventDate }: EventExpiredNoticeProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
      role="status"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">This event has already taken place.</p>
        <p className="mt-1 text-muted-foreground">
          {eventDate
            ? `The scheduled date was ${formatListingDate(eventDate)}.`
            : "The scheduled date is no longer upcoming."}
        </p>
      </div>
    </div>
  );
}
