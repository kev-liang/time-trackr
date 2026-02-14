import { AlarmScheduleRow } from "@/components/AlarmScheduleRow";
import { Card } from "@/components/ux/Card";
import { WEEKDAYS } from "@/stores/useAlarmStore";

export function AlarmScheduleCard() {
  return (
    <Card title="Schedule">
      {WEEKDAYS.map((day) => (
        <AlarmScheduleRow key={day} day={day} />
      ))}
    </Card>
  );
}
