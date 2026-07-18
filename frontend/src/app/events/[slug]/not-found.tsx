import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";

export default function EventNotFound() {
  return (
    <PageContainer
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Events & Activities", href: "/events" },
        { label: "Not found" },
      ]}
    >
      <div className="mx-auto max-w-xl space-y-4 text-center">
        <h1 className="text-h1">Event not found</h1>
        <p className="text-body-sm text-muted-foreground">
          This event may have been removed, is not approved yet, or the link may
          be incorrect.
        </p>
        <Link href="/events" className={buttonVariants({ variant: "soft" })}>
          Browse all events
        </Link>
      </div>
    </PageContainer>
  );
}
