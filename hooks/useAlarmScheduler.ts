import { useEffect } from "react";

import { scheduleNotifications } from "@/lib/notifications";
import { useAlarmStore } from "@/stores/useAlarmStore";

export function useAlarmScheduler() {
  const enabled = useAlarmStore((s) => s.enabled);
  const mutedUntil = useAlarmStore((s) => s.mutedUntil);
  const frequency = useAlarmStore((s) => s.frequency);
  const frequencyUnit = useAlarmStore((s) => s.frequencyUnit);
  const schedule = useAlarmStore((s) => s.schedule);

  useEffect(() => {
    scheduleNotifications({ enabled, mutedUntil, frequency, frequencyUnit, schedule });
  }, [enabled, mutedUntil, frequency, frequencyUnit, schedule]);
}
