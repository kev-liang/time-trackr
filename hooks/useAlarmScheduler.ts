import { useEffect } from "react";

import { scheduleNotifications } from "@/lib/notifications";
import { useAlarmStore } from "@/stores/useAlarmStore";

export function useAlarmScheduler() {
  useEffect(() => {
    const unsub = useAlarmStore.subscribe((state) => {
      scheduleNotifications(state);
    });
    return unsub;
  }, []);
}
