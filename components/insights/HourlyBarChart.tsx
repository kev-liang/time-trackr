import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, spacing, textStyles } from "@/theme";

import { formatHourLabel, type HourSlot } from "./insightsUtils";

const BAR_MAX_HEIGHT = 80;
const BAR_WIDTH = 14;
const BAR_GAP = 3;

type Props = {
  slots: HourSlot[];
};

export function HourlyBarChart({ slots }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.barsRow}>
            {slots.map((slot) => {
              const totalMinutes = slot.segments.reduce(
                (s, seg) => s + seg.minutes,
                0,
              );
              const barHeight = Math.min(
                (totalMinutes / 60) * BAR_MAX_HEIGHT,
                BAR_MAX_HEIGHT,
              );
              return (
                <View
                  key={slot.hour}
                  style={[styles.barWrapper, { width: BAR_WIDTH, marginRight: BAR_GAP }]}
                >
                  <View style={[styles.barContainer, { height: BAR_MAX_HEIGHT }]}>
                    {slot.hour % 3 === 0 && (
                      <View style={styles.tickLine} />
                    )}
                    <View style={[styles.bar, { height: barHeight }]}>
                      {[...slot.segments].reverse().map((seg, i) => {
                        const segHeight = (seg.minutes / 60) * BAR_MAX_HEIGHT;
                        return (
                          <View
                            key={i}
                            style={{ height: segHeight, backgroundColor: seg.color, width: "100%" }}
                          />
                        );
                      })}
                    </View>
                  </View>
                  <Text style={styles.label}>
                    {slot.hour % 6 === 0 ? formatHourLabel(slot.hour) : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  inner: {
    paddingRight: spacing.md,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  barWrapper: {
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
  tickLine: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 1,
    height: BAR_MAX_HEIGHT,
    backgroundColor: colors.border,
  },
  label: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
    width: BAR_WIDTH + 10,
    marginLeft: -5,
  },
});
