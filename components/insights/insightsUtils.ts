import type { Activity } from "@/stores/useActivityStore";
import { durationMinutes } from "@/utils/activityTime";

export type Segment = { color: string; minutes: number };
export type HourSlot = { hour: number; segments: Segment[] };
export type ActivityTotal = { title: string; color: string; minutes: number };

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatDateTitle(date: Date): string {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `${weekday}, ${month} ${day}${suffix}`;
}

export function formatHourLabel(hour: number): string {
  if (hour === 0) return "12A";
  if (hour < 12) return `${hour}A`;
  if (hour === 12) return "12P";
  return `${hour - 12}P`;
}

export function buildHourSlots(activities: Activity[]): HourSlot[] {
  const slots: HourSlot[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    segments: [],
  }));

  for (const activity of activities) {
    const start = new Date(activity.start);
    const end = new Date(activity.end);
    const startMs = start.getTime();
    const endMs = end.getTime();

    for (let h = start.getHours(); h <= Math.min(end.getHours(), 23); h++) {
      const slotStartMs = new Date(start).setHours(h, 0, 0, 0);
      const slotEndMs = new Date(start).setHours(h, 59, 59, 999);
      const overlapStart = Math.max(startMs, slotStartMs);
      const overlapEnd = Math.min(endMs, slotEndMs);
      const minutes = (overlapEnd - overlapStart) / 60000;
      if (minutes > 0.5) {
        slots[h].segments.push({ color: activity.color, minutes });
      }
    }
  }
  for (let slot in slots) {
    console.log(slot, slots[slot]);
  }
  return slots;
}

export function buildActivityTotals(activities: Activity[]): ActivityTotal[] {
  const map = new Map<string, ActivityTotal>();
  for (const a of activities) {
    const minutes = durationMinutes(a.start, a.end);
    const existing = map.get(a.title);
    if (existing) {
      existing.minutes += minutes;
    } else {
      map.set(a.title, { title: a.title, color: a.color, minutes });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.minutes - a.minutes);
}
