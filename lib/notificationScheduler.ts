import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import { BackgroundTaskResult } from "expo-background-task";

import { scheduleNotifications } from "@/lib/notifications";
import { useAlarmStore } from "@/stores/useAlarmStore";

const RESCHEDULE_TASK = "ALARM_RESCHEDULE_TASK";

TaskManager.defineTask(RESCHEDULE_TASK, async () => {
  try {
    const state = useAlarmStore.getState();
    await scheduleNotifications(state);
    return BackgroundTaskResult.Success;
  } catch {
    return BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundReschedule(): Promise<void> {
  await BackgroundTask.registerTaskAsync(RESCHEDULE_TASK, {
    minimumInterval: 12 * 60, // 12 hours in minutes
  });
}

export async function unregisterBackgroundReschedule(): Promise<void> {
  await BackgroundTask.unregisterTaskAsync(RESCHEDULE_TASK);
}
