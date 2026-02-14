import moment from "moment";

/** Turn "2025-02-12 09:00" into "09.00" */
export function formatTime(dateString: string): string {
  return moment(dateString, "YYYY-MM-DD HH:mm").format("HH.mm");
}
