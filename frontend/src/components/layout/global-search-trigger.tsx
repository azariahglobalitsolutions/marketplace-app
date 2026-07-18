"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GlobalSearchTriggerProps = {
  className?: string;
};

export function GlobalSearchTrigger({ className }: GlobalSearchTriggerProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "w-full justify-start gap-2 text-muted-foreground sm:w-auto sm:min-w-[12rem]",
        className,
      )}
      aria-label="Open search"
      onClick={() => {
        /* Search modal will be implemented in a future task */
      }}
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="truncate">Search listings</span>
    </Button>
  );
}
