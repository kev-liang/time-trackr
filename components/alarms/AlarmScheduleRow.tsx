import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { TimeSpinnerPicker } from "@/components/ux/TimeSpinnerPicker";
import { Toggle } from "@/components/ux/Toggle";
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

function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

type AlarmScheduleRowProps = {
  day: Weekday;
};

export function AlarmScheduleRow({ day }: AlarmScheduleRowProps) {
  const enabled = useAlarmStore((s) => s.enabled);
  const schedule = useAlarmStore((s) => s.schedule[day]);
  const toggleDay = useAlarmStore((s) => s.toggleDay);
  const setDayStartTime = useAlarmStore((s) => s.setDayStartTime);
  const setDayEndTime = useAlarmStore((s) => s.setDayEndTime);

  const [pickerField, setPickerField] = useState<PickerField | null>(null);

  const [startH, startM] = schedule.startTime.split(":").map(Number);
  const [endH, endM] = schedule.endTime.split(":").map(Number);
  const isOvernight = endH * 60 + endM <= startH * 60 + startM;

  useEffect(() => {
    if (!enabled) setPickerField(null);
  }, [enabled]);

  const handleToggle = useCallback(() => toggleDay(day), [day, toggleDay]);

  const handleTimePress = useCallback((field: PickerField) => {
    setPickerField((prev) => (prev === field ? null : field));
  }, []);

  const handlePickerChange = useCallback(
    (date: Date) => {
      const time = dateToTime(date);
      if (pickerField === "startTime") {
        setDayStartTime(day, time);
      } else if (pickerField === "endTime") {
        setDayEndTime(day, time);
      }
    },
    [pickerField, day, setDayStartTime, setDayEndTime],
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <AppText variant="bodySemiBold" style={styles.dayLabel}>
          {day}
        </AppText>
        <Toggle
          value={schedule.active}
          onValueChange={handleToggle}
          disabled={!enabled}
        />
        <Pressable
          onPress={() => handleTimePress("startTime")}
          disabled={!enabled || !schedule.active}
          style={[
            styles.timeButton,
            pickerField === "startTime" && styles.timeButtonActive,
          ]}
        >
          <AppText
            variant="body"
            color={
              enabled && schedule.active ? colors.text : colors.textSecondary
            }
          >
            {formatTimeDisplay(schedule.startTime)}
          </AppText>
        </Pressable>
        <AppText variant="body" color={colors.textSecondary}>
          –
        </AppText>
        <Pressable
          onPress={() => handleTimePress("endTime")}
          disabled={!enabled || !schedule.active}
          style={[
            styles.timeButton,
            pickerField === "endTime" && styles.timeButtonActive,
          ]}
        >
          <AppText
            variant="body"
            color={
              enabled && schedule.active ? colors.text : colors.textSecondary
            }
          >
            {formatTimeDisplay(schedule.endTime)}
          </AppText>
        </Pressable>
      </View>
      {enabled && schedule.active && isOvernight && (
        <View style={styles.nextDayChip}>
          <AppText variant="caption" color={colors.tint}>
            next day
          </AppText>
        </View>
      )}

      {enabled && pickerField && (
        <TimeSpinnerPicker
          key={pickerField}
          value={timeToDate(
            pickerField === "startTime" ? schedule.startTime : schedule.endTime,
          )}
          minuteInterval={5}
          onChange={handlePickerChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
  timeButtonActive: {
    backgroundColor: colors.tint + "33",
  },
  nextDayChip: {
    alignSelf: "flex-end",
    backgroundColor: colors.tint + "22",
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    marginTop: 2,
    marginRight: 12,
  },
});
