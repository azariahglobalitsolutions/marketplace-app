import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type PageContainerProps = React.ComponentProps<"main"> & {
  breadcrumbs?: BreadcrumbItem[];
  narrow?: boolean;
};

export function PageContainer({
  children,
  className,
  breadcrumbs,
  narrow = false,
  ...props
}: PageContainerProps) {
  return (
    <main className={cn("flex-1 py-6 sm:py-8", className)} {...props}>
      <Container narrow={narrow}>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <Breadcrumb items={breadcrumbs} className="mb-6" />
        ) : null}
        {children}
      </Container>
    </main>
  );
}
