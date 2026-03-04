import { StyleSheet, Text, View } from "react-native";

import { colors, textStyles } from "@/theme";

import type { DaySlot } from "./insightsUtils";

const BAR_MAX_HEIGHT = 120;

type Props = {
  slots: DaySlot[];
  maxMinutes: number;
  todayDayIndex: number | null;
};

export function WeeklyBarChart({ slots, maxMinutes, todayDayIndex }: Props) {
  return (
    <View>
      <View style={styles.barsRow}>
        {slots.map((slot) => {
          const totalMinutes = slot.segments.reduce((s, seg) => s + seg.minutes, 0);
          const barHeight = maxMinutes > 0 ? (totalMinutes / maxMinutes) * BAR_MAX_HEIGHT : 0;
          return (
            <View key={slot.dayIndex} style={styles.barWrapper}>
              <View style={[styles.barContainer, { height: BAR_MAX_HEIGHT }]}>
                <View style={[styles.bar, { height: barHeight }]}>
                  {[...slot.segments].reverse().map((seg, i) => {
                    const segHeight =
                      maxMinutes > 0 ? (seg.minutes / maxMinutes) * BAR_MAX_HEIGHT : 0;
                    return (
                      <View
                        key={i}
                        style={{ height: segHeight, backgroundColor: seg.color, width: "100%" }}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.labelsRow}>
        {slots.map((slot) => (
          <View key={slot.dayIndex} style={styles.barWrapper}>
            <Text
              style={[
                styles.label,
                slot.dayIndex === todayDayIndex && styles.labelToday,
              ]}
            >
              {slot.dayLabel}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  labelsRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
  },
  barContainer: {
    justifyContent: "flex-end",
    width: "100%",
  },
  bar: {
    width: "100%",
    borderRadius: 3,
    overflow: "hidden",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  label: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textAlign: "center",
    fontSize: 11,
  },
  labelToday: {
    color: colors.tint,
    fontWeight: "600",
  },
});
