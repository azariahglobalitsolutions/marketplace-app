import { HomeHeroSection } from "@/components/home/home-hero-section";
import { EventListSkeleton } from "@/components/layout/event-card-skeleton";
import { Container, Section } from "@/components/layout/container";
import { ListingGridSkeleton } from "@/components/patterns/loading-skeleton";

export default function Loading() {
  return (
    <>
      <HomeHeroSection />
      <Section className="py-8 sm:py-10">
        <Container>
          <div className="mb-6 h-8 w-72 max-w-full animate-pulse rounded bg-muted" />
          <div className="h-36 animate-pulse rounded-2xl bg-muted" />
        </Container>
      </Section>
      <Section className="bg-muted/20 py-8 sm:py-10">
        <Container>
          <div className="mb-6 h-8 w-64 max-w-full animate-pulse rounded bg-muted" />
          <EventListSkeleton count={4} />
        </Container>
      </Section>
      <Section className="py-8 sm:py-10">
        <Container>
          <div className="mb-6 h-8 w-80 max-w-full animate-pulse rounded bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        </Container>
      </Section>
      <Section className="bg-muted/20 py-8 sm:py-10">
        <Container>
          <div className="mb-6 h-8 w-56 max-w-full animate-pulse rounded bg-muted" />
          <ListingGridSkeleton count={6} />
        </Container>
      </Section>
    </>
  );
}
