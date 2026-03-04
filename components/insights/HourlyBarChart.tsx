import { useMemo } from "react";
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
  const activeSlots = useMemo(() => {
    const first = slots.findIndex((s) => s.segments.length > 0);
    const last = slots.reduce(
      (acc, s, i) => (s.segments.length > 0 ? i : acc),
      -1,
    );
    if (first === -1) return [];
    const from = Math.max(0, first - 1);
    const to = Math.min(23, last + 1);
    return slots.slice(from, to + 1);
  }, [slots]);

  if (activeSlots.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.inner}>
          <View style={styles.barsRow}>
            {activeSlots.map((slot) => {
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
                    {slot.hour % 3 === 0 ? formatHourLabel(slot.hour) : ""}
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
    marginTop: 4,
    textAlign: "center",
    width: BAR_WIDTH + 10,
    marginLeft: -5,
  },
});
