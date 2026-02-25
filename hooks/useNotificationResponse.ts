import * as Notifications from "expo-notifications";
import { useLastNotificationResponse } from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";

import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { NOTIFICATION_ACTIONS } from "@/utils/consts";

function isLogTimeData(data: Record<string, unknown> | undefined): boolean {
  // Allow missing data (old scheduled notifications) or explicit log-time action.
  // Reject only if a different action is explicitly set.
  return !data?.action || data.action === NOTIFICATION_ACTIONS.LOG_TIME;
}

function triggerLogTime(router: ReturnType<typeof useRouter>) {
  const now = new Date();
  const { frequency, frequencyUnit } = useAlarmStore.getState();
  const frequencyMs =
    frequency * (frequencyUnit === "hours" ? 60 : 1) * 60 * 1000;
  const start = new Date(now.getTime() - frequencyMs);

  useActivityEditStore.getState().openCreate(start, now);
  router.navigate("/");
}

export function useNotificationResponse() {
  const lastNotificationResponse = useLastNotificationResponse();
  const router = useRouter();

  // Handles individual notification taps (foreground, background, cold start).
  useEffect(() => {
    if (!lastNotificationResponse) return;
    const data = lastNotificationResponse.notification.request.content.data;
    if (!isLogTimeData(data)) return;
    triggerLogTime(router);
  }, [lastNotificationResponse, router]);

  // Checks for presented log-time notifications
  // whenever the app becomes active and triggers the flow if any are found.
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (nextState !== "active") return;
        const presented = await Notifications.getPresentedNotificationsAsync();
        const hasLogTime = presented.some((n) =>
          isLogTimeData(n.request.content.data),
        );
        if (!hasLogTime) return;
        // Dismisses all notifications. Safe while
        // log-time is the only notification type. If other types are added,
        // switch to dismissing by identifier to avoid clearing unrelated ones.
        await Notifications.dismissAllNotificationsAsync();
        triggerLogTime(router);
      },
    );
    return () => subscription.remove();
  }, [router]);
}
