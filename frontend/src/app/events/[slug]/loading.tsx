import { PageContainer } from "@/components/layout/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetailLoading() {
  return (
    <PageContainer
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Events & Activities", href: "/events" },
        { label: "Loading..." },
      ]}
    >
      <div className="space-y-8" aria-busy aria-label="Loading event details">
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full max-w-3xl" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
