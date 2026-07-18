import Link from "next/link";
import {
  CalendarDays,
  GraduationCap,
  HeartPulse,
  Store,
  Users,
} from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { ErrorState } from "@/components/patterns/error-state";
import { CATEGORY_ROUTES } from "@/lib/home/constants";
import type { CategoryOption } from "@/types/api";
import { cn } from "@/lib/utils";

const categoryIcons = {
  events: CalendarDays,
  restaurants: Store,
  health: HeartPulse,
  education: GraduationCap,
  communities: Users,
} as const;

type CategoryGridSectionProps = {
  categories: CategoryOption[];
  error?: string;
  className?: string;
};

export function CategoryGridSection({
  categories,
  error,
  className,
}: CategoryGridSectionProps) {
  return (
    <Section className={className} aria-labelledby="category-grid-heading">
      <Container>
        <SectionHeading
          as="h2"
          title="Browse the five primary categories"
          description="Explore Habesha events, businesses, and community resources by category."
        />

        {error ? (
          <ErrorState message={error} title="Could not load categories" />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon =
                categoryIcons[category.id as keyof typeof categoryIcons] ??
                CalendarDays;

              return (
                <li key={category.id}>
                  <Link
                    href={CATEGORY_ROUTES[category.id]}
                    className={cn(
                      "group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition",
                      "hover:border-primary/30 hover:shadow-md",
                    )}
                  >
                    <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <h3 className="text-h3">{category.label}</h3>
                    <p className="text-body-sm mt-2 text-muted-foreground">
                      View approved {category.id.replace("_", " ")} listings
                      nationwide.
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </Section>
  );
}
