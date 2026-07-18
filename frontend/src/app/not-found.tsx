import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <PageContainer>
      <div className="mx-auto flex max-w-lg flex-col items-start gap-4 py-16">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          The page you are looking for does not exist or may have moved.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/" />}>Home</Button>
          <Button variant="outline" render={<Link href="/events" />}>
            Events
          </Button>
          <Button variant="outline" render={<Link href="/restaurants" />}>
            Restaurants
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
