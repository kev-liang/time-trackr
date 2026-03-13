import { StyleSheet, Text, View } from "react-native";

import { colors, textStyles } from "@/theme";

import { formatHourLabel, type HourSlot } from "./insightsUtils";

const BAR_MAX_HEIGHT = 120;
const BAR_WIDTH = 14;
const BAR_GAP = 3;

type Props = {
  slots: HourSlot[];
};

export function HourlyBarChart({ slots }: Props) {
  return (
    <View>
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
            <View key={slot.hour} style={styles.barWrapper}>
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
            </View>
          );
        })}
      </View>

      <View style={styles.labelsRow}>
        {slots.map((slot) => (
          <View key={slot.hour} style={styles.barWrapper}>
            <Text style={styles.label}>
              {slot.hour % 3 === 0 ? formatHourLabel(slot.hour) : ""}
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
    gap: BAR_GAP,
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
    width: BAR_WIDTH,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 2,
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
    textAlign: "center",
    fontSize: 10,
    width: 24,
  },
});
