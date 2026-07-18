"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <PageContainer>
      <div className="mx-auto flex max-w-lg flex-col items-start gap-4 py-16">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">
          {error.message || "We could not load this page. Please try again."}
        </p>
        <div className="flex gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button type="button" variant="outline" render={<Link href="/" />}>
            Go home
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
