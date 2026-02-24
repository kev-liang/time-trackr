import { View } from "react-native";
import { useShallow } from "zustand/react/shallow";

import { AppText } from "@/components/ux/AppText";
import { computeFireTimes } from "@/lib/notifications";
import { useAlarmStore } from "@/stores/useAlarmStore";

export function NextAlarmDisplay() {
  const alarmState = useAlarmStore(
    useShallow((s) => ({
      enabled: s.enabled,
      mutedUntil: s.mutedUntil,
      frequency: s.frequency,
      frequencyUnit: s.frequencyUnit,
      schedule: s.schedule,
    })),
  );

  if (!alarmState.enabled) return null;

  const nextFireTime = computeFireTimes(alarmState, new Date(), 1)[0] ?? null;
  const nextAlarmLabel = nextFireTime
    ? nextFireTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <View>
      <AppText variant="body">Next Alarm: {nextAlarmLabel ?? "—"}</AppText>
    </View>
  );
}
