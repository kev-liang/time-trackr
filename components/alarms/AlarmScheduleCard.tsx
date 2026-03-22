import { AlarmScheduleRow } from "@/components/alarms/AlarmScheduleRow";
import { AppText } from "@/components/ux/AppText";
import { Card } from "@/components/ux/Card";
import { useAlarmStore, WEEKDAYS } from "@/stores/useAlarmStore";
import { colors } from "@/theme";

type AlarmScheduleCardProps = {
  onPickerOpen?: (rowY: number, rowHeight: number) => void;
};

export function AlarmScheduleCard({ onPickerOpen }: AlarmScheduleCardProps) {
  const enabled = useAlarmStore((s) => s.enabled);
  const schedule = useAlarmStore((s) => s.schedule);
  const noActiveDays = WEEKDAYS.every((day) => !schedule[day].active);

  return (
    <Card title="Schedule">
      {!enabled && (
        <AppText variant="body" color={colors.textSecondary}>
          Enable reminders to edit schedule
        </AppText>
      )}
      {WEEKDAYS.map((day) => (
        <AlarmScheduleRow key={day} day={day} onPickerOpen={onPickerOpen} />
      ))}
      {enabled && noActiveDays && (
        <AppText variant="caption" color={colors.textSecondary}>
          No days selected and reminders won't fire.
        </AppText>
      )}
    </Card>
  );
}
