import { AlarmScheduleRow } from "@/components/alarms/AlarmScheduleRow";
import { Card } from "@/components/ux/Card";
import { AppText } from "@/components/ux/AppText";
import { useAlarmStore, WEEKDAYS } from "@/stores/useAlarmStore";
import { colors } from "@/theme";

export function AlarmScheduleCard() {
  const enabled = useAlarmStore((s) => s.enabled);

  return (
    <Card title="Schedule">
      {!enabled && (
        <AppText variant="body" color={colors.textSecondary}>
          Enable reminders to edit schedule
        </AppText>
      )}
      {WEEKDAYS.map((day) => (
        <AlarmScheduleRow key={day} day={day} />
      ))}
    </Card>
  );
}
