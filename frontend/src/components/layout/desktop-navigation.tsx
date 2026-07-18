"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { actionNavigation, primaryNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-foreground/80 hover:bg-muted hover:text-foreground",
        className,
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

export function DesktopNavigation() {
  return (
    <nav
      className="hidden border-t border-border lg:block"
      aria-label="Primary"
    >
      <div className="flex flex-wrap items-center gap-1 py-2">
        {primaryNavigation.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} />
        ))}
        <span className="mx-2 hidden h-5 w-px bg-border xl:inline" aria-hidden />
        {actionNavigation.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            className="font-semibold text-primary"
          />
        ))}
      </div>
    </nav>
  );
}
