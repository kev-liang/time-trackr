import type { Activity } from "@/stores/useActivityStore";

/** Convert ISO time strings to duration in minutes */
export function durationMinutes(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max((e - s) / 60000, 1);
}

/** Compute updated start/end times from drag deltas in minutes */
export function applyDragDeltas(
  event: Pick<Activity, "start" | "end">,
  deltaStartMin: number,
  deltaEndMin: number,
): Partial<Pick<Activity, "start" | "end">> {
  const updates: Partial<Pick<Activity, "start" | "end">> = {};

  if (deltaStartMin !== 0) {
    const newStart = new Date(
      new Date(event.start).getTime() + deltaStartMin * 60000,
    );
    updates.start = newStart.toISOString();
  }
  if (deltaEndMin !== 0) {
    const newEnd = new Date(
      new Date(event.end).getTime() + deltaEndMin * 60000,
    );
    updates.end = newEnd.toISOString();
  }

  return updates;
}
