import { useLastNotificationResponse } from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { NOTIFICATION_ACTIONS } from "@/utils/consts";

export function useNotificationResponse() {
  const lastNotificationResponse = useLastNotificationResponse();
  const router = useRouter();

  useEffect(() => {
    if (!lastNotificationResponse) return;
    const data = lastNotificationResponse.notification.request.content.data;
    // Allow missing data (old scheduled notifications) or explicit log-time action.
    // Reject only if a different action is explicitly set.
    if (data?.action && data.action !== NOTIFICATION_ACTIONS.LOG_TIME) return;

    const now = new Date();
    const { frequency, frequencyUnit } = useAlarmStore.getState();
    const frequencyMs =
      frequency * (frequencyUnit === "hours" ? 60 : 1) * 60 * 1000;
    const start = new Date(now.getTime() - frequencyMs);

    useActivityEditStore.getState().openCreate(start, now);
    router.navigate("/");
  }, [lastNotificationResponse, router]);
}
