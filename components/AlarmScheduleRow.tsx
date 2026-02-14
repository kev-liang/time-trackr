import { useCallback, useState } from "react";
import { Platform, Pressable, StyleSheet, Switch, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { AppText } from "@/components/ux/AppText";
import { useAlarmStore, type Weekday } from "@/stores/useAlarmStore";
import { colors, spacing } from "@/theme";

type PickerField = "startTime" | "endTime";

function timeToDate(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

type AlarmScheduleRowProps = {
  day: Weekday;
};

export function AlarmScheduleRow({ day }: AlarmScheduleRowProps) {
  const schedule = useAlarmStore((s) => s.schedule[day]);
  const toggleDay = useAlarmStore((s) => s.toggleDay);
  const setDayStartTime = useAlarmStore((s) => s.setDayStartTime);
  const setDayEndTime = useAlarmStore((s) => s.setDayEndTime);

  const [pickerField, setPickerField] = useState<PickerField | null>(null);

  const handleToggle = useCallback(() => toggleDay(day), [day, toggleDay]);

  const openPicker = useCallback((field: PickerField) => {
    setPickerField(field);
  }, []);

  const handlePickerChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") {
        setPickerField(null);
      }
      if (event.type === "dismissed" || !date) {
        setPickerField(null);
        return;
      }
      const time = dateToTime(date);
      if (pickerField === "startTime") {
        setDayStartTime(day, time);
      } else if (pickerField === "endTime") {
        setDayEndTime(day, time);
      }
      if (Platform.OS === "android") {
        setPickerField(null);
      }
    },
    [pickerField, day, setDayStartTime, setDayEndTime],
  );

  const closePicker = useCallback(() => setPickerField(null), []);

  return (
    <View style={styles.row}>
      <AppText variant="bodySemiBold" style={styles.dayLabel}>
        {day}
      </AppText>
      <Switch
        value={schedule.active}
        onValueChange={handleToggle}
        trackColor={{ true: colors.tint }}
      />
      <Pressable
        onPress={() => openPicker("startTime")}
        disabled={!schedule.active}
        style={styles.timeButton}
      >
        <AppText
          variant="body"
          color={schedule.active ? colors.text : colors.textSecondary}
        >
          {schedule.startTime}
        </AppText>
      </Pressable>
      <AppText variant="body" color={colors.textSecondary}>
        –
      </AppText>
      <Pressable
        onPress={() => openPicker("endTime")}
        disabled={!schedule.active}
        style={styles.timeButton}
      >
        <AppText
          variant="body"
          color={schedule.active ? colors.text : colors.textSecondary}
        >
          {schedule.endTime}
        </AppText>
      </Pressable>

      {pickerField && (
        <>
          <DateTimePicker
            value={timeToDate(
              pickerField === "startTime"
                ? schedule.startTime
                : schedule.endTime,
            )}
            mode="time"
            is24Hour
            onChange={handlePickerChange}
          />
          {Platform.OS === "ios" && (
            <Pressable onPress={closePicker} style={styles.doneButton}>
              <AppText variant="bodySemiBold" color={colors.tint}>
                Done
              </AppText>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dayLabel: {
    width: 40,
  },
  timeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  doneButton: {
    paddingHorizontal: spacing.sm,
  },
});
