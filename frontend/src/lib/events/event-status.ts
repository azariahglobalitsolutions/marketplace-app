import { parseISO, startOfDay } from "date-fns";

export function isExpiredEvent(
  eventDate: string | null | undefined,
  reference: Date = new Date(),
): boolean {
  if (!eventDate) {
    return false;
  }

  try {
    return startOfDay(parseISO(eventDate)) < startOfDay(reference);
  } catch {
    return false;
  }
}
