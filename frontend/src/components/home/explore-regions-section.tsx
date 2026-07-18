import Link from "next/link";
import { MapPinned } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { POPULAR_REGIONS } from "@/lib/home/constants";
import { cn } from "@/lib/utils";

type ExploreRegionsSectionProps = {
  className?: string;
};

export function ExploreRegionsSection({ className }: ExploreRegionsSectionProps) {
  return (
    <Section className={className} aria-labelledby="explore-regions-heading">
      <Container>
        <SectionHeading
          as="h2"
          title="Explore by popular states and metro areas"
          description="Shortcut links to approved listings and events in communities with active Habesha networks. No rankings or counts are shown."
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_REGIONS.map((region) => (
            <li key={region.state + region.label}>
              <Link
                href={`/events?state=${encodeURIComponent(region.state)}`}
                className={cn(
                  "flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition",
                  "hover:border-primary/30 hover:bg-muted/30",
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPinned className="size-4" aria-hidden />
                </div>
                <div>
                  <h3 className="text-h3">{region.label}</h3>
                  <p className="text-body-sm mt-1 text-muted-foreground">
                    {region.description}
                  </p>
                  <p className="text-caption mt-2 text-primary">
                    Browse {region.state}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
