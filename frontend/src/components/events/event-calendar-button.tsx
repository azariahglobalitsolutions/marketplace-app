"use client";

import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildIcsCalendarContent,
  downloadIcsFile,
} from "@/lib/events/calendar";
import type { ListingResponse } from "@/types/api";

type EventCalendarButtonProps = {
  event: ListingResponse;
};

export function EventCalendarButton({ event }: EventCalendarButtonProps) {
  function handleAddToCalendar() {
    const content = buildIcsCalendarContent(event);
    if (!content) {
      return;
    }

    downloadIcsFile(`wube-bereha-event-${event.id}.ics`, content);
  }

  const disabled = !event.event_date;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleAddToCalendar}
      disabled={disabled}
    >
      <CalendarPlus aria-hidden />
      Add to calendar
    </Button>
  );
}
