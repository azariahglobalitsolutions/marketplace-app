import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentProps<"div"> & {
  as?: "div" | "section" | "main" | "article";
  narrow?: boolean;
};

export function Container({
  as: Component = "div",
  narrow = false,
  className,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-(--container-max) px-(--container-padding)",
        narrow && "max-w-3xl",
        className,
      )}
      {...props}
    />
  );
}

export function Section({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("py-(--section-gap)", className)}
      {...props}
    />
  );
}
