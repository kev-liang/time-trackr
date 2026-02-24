import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

import { scheduleNotifications } from "@/lib/notifications";
import { useAlarmStore } from "@/stores/useAlarmStore";

const RESCHEDULE_TASK = "ALARM_RESCHEDULE_TASK";

TaskManager.defineTask(RESCHEDULE_TASK, async () => {
  try {
    const state = useAlarmStore.getState();
    await scheduleNotifications(state);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundReschedule(): Promise<void> {
  await BackgroundFetch.registerTaskAsync(RESCHEDULE_TASK, {
    minimumInterval: 12 * 60 * 60, // 12 hours in seconds
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterBackgroundReschedule(): Promise<void> {
  await BackgroundFetch.unregisterTaskAsync(RESCHEDULE_TASK);
}
