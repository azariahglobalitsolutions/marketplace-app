"use client";

import { Button } from "@/components/ui/button";
import type { PaginationResult } from "@/lib/events/filters";
import { cn } from "@/lib/utils";

type EventsPaginationProps = {
  pagination: Pick<
    PaginationResult<unknown>,
    "page" | "totalPages" | "totalItems"
  >;
  onPageChange: (page: number) => void;
  className?: string;
};

export function EventsPagination({
  pagination,
  onPageChange,
  className,
}: EventsPaginationProps) {
  if (pagination.totalItems === 0) {
    return null;
  }

  return (
    <nav
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}
      aria-label="Events pagination"
    >
      <p className="text-body-sm text-muted-foreground">
        Page {pagination.page} of {pagination.totalPages} ·{" "}
        {pagination.totalItems} event{pagination.totalItems === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
