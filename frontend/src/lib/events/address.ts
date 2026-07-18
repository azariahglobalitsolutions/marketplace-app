import type { ListingResponse } from "@/types/api";

export type EventAddressParts = {
  venue?: string | null;
  city: string;
  state: string;
};

export function formatEventAddress(event: Pick<ListingResponse, "venue" | "city" | "state">): {
  lines: string[];
  singleLine: string;
} {
  const locality = `${event.city}, ${event.state}`;
  const lines = [event.venue, locality].filter(
    (line): line is string => Boolean(line && line.trim()),
  );

  return {
    lines,
    singleLine: lines.join(", "),
  };
}
