"use client";

import { ErrorState } from "@/components/patterns/error-state";

type ListingErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ListingErrorState({ message, onRetry }: ListingErrorStateProps) {
  return (
    <ErrorState
      title="Could not load listings"
      message={message}
      retryLabel="Reload page"
      onRetry={onRetry}
    />
  );
}
