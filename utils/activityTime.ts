import type { Activity } from "@/stores/useActivityStore";

export const MS_PER_MINUTE = 60000;
export const MIN_HEIGHT_FOR_TIME = 40;
export const SNAP_INTERVAL_MINUTES = 15;

/** Convert ISO time strings to duration in minutes */
export function durationMinutes(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max((e - s) / MS_PER_MINUTE, 1);
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
      new Date(event.start).getTime() + deltaStartMin * MS_PER_MINUTE,
    );
    updates.start = newStart.toISOString();
  }
  if (deltaEndMin !== 0) {
    const newEnd = new Date(
      new Date(event.end).getTime() + deltaEndMin * MS_PER_MINUTE,
    );
    updates.end = newEnd.toISOString();
  }

  return updates;
}
