import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

import type { DaySchedule, Weekday } from "@/stores/useAlarmStore";
import { NOTIFICATION_ACTIONS } from "@/utils/consts";

function isInWindow(schedule: DaySchedule, cursorMinutes: number): boolean {
  const [startH, startM] = schedule.startTime.split(":").map(Number);
  const [endH, endM] = schedule.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (endMinutes <= startMinutes) {
    // Midnight-crossing schedule (e.g. 9am–1am): valid after start OR before end
    return cursorMinutes >= startMinutes || cursorMinutes < endMinutes;
  }
  return cursorMinutes >= startMinutes && cursorMinutes < endMinutes;
}

export type AlarmState = {
  enabled: boolean;
  mutedUntil: string | null;
  frequency: number;
  frequencyUnit: "minutes" | "hours";
  schedule: Record<Weekday, DaySchedule>;
};

const DAY_INDEX_TO_WEEKDAY: Weekday[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function hasPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * Pure function: compute up to `limit` future fire times from `from`
 * based on the alarm schedule state.
 */
export function computeFireTimes(
  state: AlarmState,
  from: Date,
  limit: number,
): Date[] {
  if (!state.enabled) return [];

  const frequencyMs =
    state.frequencyUnit === "hours"
      ? state.frequency * 60 * 60 * 1000
      : state.frequency * 60 * 1000;

  const mutedUntilMs = state.mutedUntil
    ? new Date(state.mutedUntil).getTime()
    : null;

  const results: Date[] = [];
  const maxMs = from.getTime() + 4 * 7 * 24 * 60 * 60 * 1000; // 4 weeks out

  // Snap to next frequency boundary after `from`
  let cursor = new Date(Math.ceil(from.getTime() / frequencyMs) * frequencyMs);

  while (cursor.getTime() < maxMs && results.length < limit) {
    const cursorMinutes = cursor.getHours() * 60 + cursor.getMinutes();
    const weekday = DAY_INDEX_TO_WEEKDAY[cursor.getDay()];
    const daySchedule = state.schedule[weekday];

    let inWindow = daySchedule?.active
      ? isInWindow(daySchedule, cursorMinutes)
      : false;

    // Check previous day's midnight-crossing schedule (e.g. Sat 9am–1am covers Sun 12am–1am)
    if (!inWindow) {
      const prevWeekday = DAY_INDEX_TO_WEEKDAY[(cursor.getDay() + 6) % 7];
      const prevSchedule = state.schedule[prevWeekday];
      if (prevSchedule?.active) {
        const [prevEndH, prevEndM] = prevSchedule.endTime
          .split(":")
          .map(Number);
        const [prevStartH, prevStartM] = prevSchedule.startTime
          .split(":")
          .map(Number);
        const prevEndMinutes = prevEndH * 60 + prevEndM;
        const prevStartMinutes = prevStartH * 60 + prevStartM;
        if (
          prevEndMinutes <= prevStartMinutes &&
          cursorMinutes < prevEndMinutes
        ) {
          inWindow = true;
        }
      }
    }

    const notMuted = mutedUntilMs === null || cursor.getTime() >= mutedUntilMs;

    if (inWindow && notMuted) {
      results.push(new Date(cursor));
    }

    cursor = new Date(cursor.getTime() + frequencyMs);
  }

  return results;
}

export async function scheduleNotifications(state: AlarmState): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!state.enabled) return;

  const fireTimes = computeFireTimes(state, new Date(), 64);

  for (const fireDate of fireTimes) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "TimeTracer",
        body: "What have you been up to?",
        sound: true,
        data: { action: NOTIFICATION_ACTIONS.LOG_TIME },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
