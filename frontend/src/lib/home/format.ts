import { format, parseISO } from "date-fns";

export function formatListingDate(date: string | null | undefined): string {
  if (!date) {
    return "Date TBA";
  }

  try {
    return format(parseISO(date), "EEE, MMM d, yyyy");
  } catch {
    return date;
  }
}

export function formatListingTime(time: string | null | undefined): string | null {
  if (!time) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}
