import moment from "moment";

/**
 * Format a Date as a local datetime string with no timezone suffix.
 * Calendar-kit treats dateTime strings as local time, so we must NOT use
 * toISOString() (which outputs UTC with a Z suffix).
 */
export function toLocalDateTimeString(date: Date): string {
  return moment(date).format("YYYY-MM-DDTHH:mm:00");
}

/** Turn a local datetime string into "HH.mm" for display */
export function formatTime(dateString: string): string {
  return moment(dateString).format("HH.mm");
}
