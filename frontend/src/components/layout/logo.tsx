import Link from "next/link";

import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  compact?: boolean;
};

export function Logo({ className, compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex min-w-0 flex-col rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
      aria-label={`${brand.name} ${brand.nameAmharic} home`}
    >
      <span className="truncate font-heading text-base font-semibold leading-tight text-foreground sm:text-lg">
        {brand.name}
      </span>
      {!compact ? (
        <>
          <span
            lang="am"
            className="text-brand-amharic truncate text-sm font-medium leading-tight text-primary sm:text-base"
          >
            {brand.nameAmharic}
          </span>
          <span className="text-caption mt-0.5 hidden truncate sm:block">
            {brand.tagline}
          </span>
        </>
      ) : null}
    </Link>
  );
}
