"use client";

import { Button } from "@/components/ui/button";
import type { PaginationResult } from "@/lib/directory/filters";
import { cn } from "@/lib/utils";

type PaginationProps = {
  pagination: Pick<PaginationResult<unknown>, "page" | "totalPages" | "totalItems">;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  pagination,
  onPageChange,
  className,
}: PaginationProps) {
  if (pagination.totalItems === 0) {
    return null;
  }

  return (
    <nav
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      aria-label="Pagination"
    >
      <p className="text-body-sm text-muted-foreground">
        Page {pagination.page} of {pagination.totalPages} ·{" "}
        {pagination.totalItems} listing{pagination.totalItems === 1 ? "" : "s"}
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
