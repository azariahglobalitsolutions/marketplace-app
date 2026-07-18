import { format, parseISO } from "date-fns";

import { formatEventAddress } from "@/lib/events/address";
import type { ListingResponse } from "@/types/api";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatIcsDateTime(date: string, time?: string | null): string {
  const parsed = parseISO(date);
  const [hours = 0, minutes = 0] = (time ?? "00:00").split(":").map(Number);

  return `${format(parsed, "yyyyMMdd")}T${pad(hours)}${pad(minutes)}00`;
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildIcsCalendarContent(event: ListingResponse): string | null {
  if (!event.event_date) {
    return null;
  }

  const address = formatEventAddress(event);
  const dtStart = formatIcsDateTime(event.event_date, event.start_time);
  const dtEnd = formatIcsDateTime(
    event.event_date,
    event.end_time ?? event.start_time,
  );
  const now = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wube Bereha//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:event-${event.id}@wubebereha`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
  ];

  if (address.singleLine) {
    lines.push(`LOCATION:${escapeIcsText(address.singleLine)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
