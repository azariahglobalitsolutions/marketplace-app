import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
};

export function SectionHeading({
  title,
  description,
  action,
  as: Component = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        <Component id={id} className="text-h2">
          {title}
        </Component>
        {description ? (
          <p className="text-body-sm max-w-3xl text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
