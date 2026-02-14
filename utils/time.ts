/** Turn "2025-02-12 09:00" into "09.00" */
export function formatTime(isoish: string): string {
  const timePart = isoish.split(" ")[1] ?? "";
  return timePart.replace(":", ".");
}
