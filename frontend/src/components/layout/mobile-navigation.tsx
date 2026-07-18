"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { actionNavigation, primaryNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function MobileNavLink({
  href,
  label,
  description,
  onNavigate,
}: {
  href: string;
  label: string;
  description?: string;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "block rounded-lg px-3 py-3 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="block text-sm font-medium">{label}</span>
      {description ? (
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {description}
        </span>
      ) : null}
    </Link>
  );
}

export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SheetDescription className="sr-only">
            Browse Wube Bereha categories and actions
          </SheetDescription>
          <div className="px-1 py-2">
            <Logo compact />
          </div>
        </SheetHeader>
        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
          aria-label="Primary"
        >
          {primaryNavigation.map((item) => (
            <MobileNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              description={item.description}
              onNavigate={() => setOpen(false)}
            />
          ))}
          <div className="my-2 border-t border-border" role="separator" />
          <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Contribute
          </p>
          {actionNavigation.map((item) => (
            <MobileNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
