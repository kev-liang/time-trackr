import { StyleSheet, Text, View } from "react-native";

import { colors, textStyles } from "@/theme";

import type { DaySlot } from "./insightsUtils";
import { buildGridLines, WeeklyGridLines, WeeklyYAxis } from "./WeeklyGridLines";

const BAR_MAX_HEIGHT = 120;
const Y_AXIS_WIDTH = 28;

type Props = {
  slots: DaySlot[];
  maxMinutes: number;
  todayDayIndex: number | null;
};

export function WeeklyBarChart({ slots, maxMinutes, todayDayIndex }: Props) {
  const gridLines = buildGridLines(maxMinutes, BAR_MAX_HEIGHT);

  return (
    <View>
      <View style={styles.chartRow}>
        <WeeklyYAxis gridLines={gridLines} height={BAR_MAX_HEIGHT} width={Y_AXIS_WIDTH} />

        <View style={styles.chartArea}>
          <WeeklyGridLines gridLines={gridLines} />

          <View style={styles.barsRow}>
            {slots.map((slot) => {
              const totalMinutes = slot.segments.reduce((s, seg) => s + seg.minutes, 0);
              const barHeight =
                maxMinutes > 0 ? (totalMinutes / maxMinutes) * BAR_MAX_HEIGHT : 0;
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
        </View>
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
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  chartArea: {
    flex: 1,
    height: BAR_MAX_HEIGHT,
    position: "relative",
  },
  barsRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  labelsRow: {
    flexDirection: "row",
    marginTop: 4,
    paddingLeft: Y_AXIS_WIDTH,
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
