"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { MapPin, Search } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CLIENT_SIDE_KEYWORD_SEARCH } from "@/lib/dev/client-features";
import { cn } from "@/lib/utils";

type HomeSearchSectionProps = {
  states: string[];
  initialKeyword?: string;
  initialState?: string;
  className?: string;
};

export function HomeSearchSection({
  states,
  initialKeyword = "",
  initialState = "",
  className,
}: HomeSearchSectionProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [state, setState] = useState(initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (keyword.trim()) {
      params.set("q", keyword.trim());
    }
    if (state) {
      params.set("state", state);
    }

    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <Section className={cn("py-8 sm:py-10", className)} aria-labelledby="home-search-heading">
      <Container>
        <SectionHeading
          as="h2"
          title="Search by keyword and location"
          description="Filter upcoming events on this page by keyword and U.S. state. Location uses live data from the listings API."
        />
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="home-search-keyword">Keyword</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="home-search-keyword"
                name="q"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Event name, cuisine, service..."
                className="pl-9"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="home-search-state">Location</Label>
            <div className="relative">
              <MapPin
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <select
                id="home-search-state"
                name="state"
                value={state}
                onChange={(event) => setState(event.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">All states</option>
                {states.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Search
          </Button>
        </form>
        {CLIENT_SIDE_KEYWORD_SEARCH.enabled ? (
          <p
            className="text-caption mt-3 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2"
            data-dev-notice="client-side-keyword-search"
          >
            {CLIENT_SIDE_KEYWORD_SEARCH.notice}
          </p>
        ) : null}
      </Container>
    </Section>
  );
}
