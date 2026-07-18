import type { ReactNode } from "react";

import { Container, Section } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type ListingDetailLayoutProps = {
  breadcrumbs?: ReactNode;
  header: ReactNode;
  media?: ReactNode;
  main: ReactNode;
  sidebar?: ReactNode;
  related?: ReactNode;
  className?: string;
};

export function ListingDetailLayout({
  breadcrumbs,
  header,
  media,
  main,
  sidebar,
  related,
  className,
}: ListingDetailLayoutProps) {
  return (
    <Section className={cn("py-6 sm:py-8", className)}>
      <Container>
        {breadcrumbs}
        <article className="space-y-8">
          {header}
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-8">
              {media}
              <div className="space-y-6">{main}</div>
              {related}
            </div>
            {sidebar ? (
              <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                {sidebar}
              </aside>
            ) : null}
          </div>
        </article>
      </Container>
    </Section>
  );
}
