import { EventsPageViewSkeleton } from "@/components/events/events-page-view";
import { PageContainer } from "@/components/layout/page-container";

export default function EventsLoading() {
  return (
    <PageContainer
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Events & Activities" },
      ]}
    >
      <EventsPageViewSkeleton />
    </PageContainer>
  );
}
