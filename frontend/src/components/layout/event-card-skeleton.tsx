import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        "flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm",
        className,
      )}
      aria-hidden
    >
      <div className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-lg bg-muted/60 p-2">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-7 w-10" />
        <Skeleton className="h-3 w-10" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
    </article>
  );
}

export function EventListSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("space-y-4", className)}
      aria-busy
      aria-label="Loading events"
    >
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}
