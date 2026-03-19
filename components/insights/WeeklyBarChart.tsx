import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors, textStyles } from "@/theme";

import type { DaySlot } from "./insightsUtils";
import { buildGridLines, WeeklyGridLines, WeeklyYAxis } from "./WeeklyGridLines";

const BAR_MAX_HEIGHT = 120;
const Y_AXIS_WIDTH = 28;

type Props = {
  slots: DaySlot[];
  maxMinutes: number;
  todayDayIndex: number | null;
  highlightedTitles: Set<string> | null;
  setHighlightedTitles: (titles: Set<string> | null) => void;
  clearHighlight: () => void;
};

type BarProps = {
  slot: DaySlot;
  maxMinutes: number;
  todayDayIndex: number | null;
  isHighlighted: boolean;
  isDimmed: boolean;
  highlightedTitles: Set<string> | null;
  onPress: () => void;
  onLongPress: () => void;
  clearHighlight: () => void;
};

function WeekBar({ slot, maxMinutes, todayDayIndex, isHighlighted, isDimmed, highlightedTitles, onPress, onLongPress, clearHighlight }: BarProps) {
  const longPressActive = useRef(false);
  const totalMinutes = slot.segments.reduce((s, seg) => s + seg.minutes, 0);
  const barHeight = maxMinutes > 0 ? (totalMinutes / maxMinutes) * BAR_MAX_HEIGHT : 0;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isDimmed ? 0.5 : 1, { duration: 150 }),
    transform: [
      { translateY: withSpring(isHighlighted ? -(barHeight * 0.075) : 0, { damping: 18, stiffness: 250 }) },
      { scaleY: withSpring(isHighlighted ? 1.15 : 1, { damping: 18, stiffness: 250 }) },
    ],
  }));

  return (
    <View style={styles.barWrapper}>
      <Pressable
        onPress={onPress}
        onLongPress={() => { longPressActive.current = true; onLongPress(); }}
        onPressOut={() => { if (longPressActive.current) { longPressActive.current = false; clearHighlight(); } }}
        style={styles.barContainer}
      >
        <View style={{ height: BAR_MAX_HEIGHT, justifyContent: "flex-end" }}>
          <Animated.View style={[styles.bar, { height: barHeight }, animatedStyle]}>
            {[...slot.segments].reverse().map((seg, i) => {
              const segHeight = maxMinutes > 0 ? (seg.minutes / maxMinutes) * BAR_MAX_HEIGHT : 0;
              const segDimmed = highlightedTitles !== null && !highlightedTitles.has(seg.title);
              return (
                <View
                  key={i}
                  style={{
                    height: segHeight,
                    backgroundColor: seg.color,
                    width: "100%",
                    opacity: segDimmed ? 0.35 : 1,
                  }}
                />
              );
            })}
          </Animated.View>
        </View>
      </Pressable>
      <Text
        style={[
          styles.label,
          slot.dayIndex === todayDayIndex && styles.labelToday,
        ]}
      >
        {slot.dayLabel}
      </Text>
    </View>
  );
}

export function WeeklyBarChart({ slots, maxMinutes, todayDayIndex, highlightedTitles, setHighlightedTitles, clearHighlight }: Props) {
  const gridLines = buildGridLines(maxMinutes, BAR_MAX_HEIGHT);

  return (
    <View>
      <View style={styles.chartRow}>
        <WeeklyYAxis gridLines={gridLines} height={BAR_MAX_HEIGHT} width={Y_AXIS_WIDTH} />

        <View style={styles.chartArea}>
          <WeeklyGridLines gridLines={gridLines} />

          <View style={styles.barsRow}>
            {slots.map((slot) => {
              const titlesInBar = new Set(slot.segments.map((s) => s.title));
              const isHighlighted =
                highlightedTitles !== null &&
                [...highlightedTitles].some((t) => titlesInBar.has(t));
              const isDimmed = highlightedTitles !== null && !isHighlighted;
              return (
                <WeekBar
                  key={slot.dayIndex}
                  slot={slot}
                  maxMinutes={maxMinutes}
                  todayDayIndex={todayDayIndex}
                  isHighlighted={isHighlighted}
                  isDimmed={isDimmed}
                  highlightedTitles={highlightedTitles}
                  onPress={() => isHighlighted ? clearHighlight() : setHighlightedTitles(new Set(slot.segments.map((s) => s.title)))}
                  onLongPress={() => setHighlightedTitles(new Set(slot.segments.map((s) => s.title)))}
                  clearHighlight={clearHighlight}
                />
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.labelsRow}>
        {slots.map((slot) => (
          <View key={slot.dayIndex} style={styles.barWrapper} />
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
    marginTop: 4,
  },
  labelToday: {
    color: colors.tint,
    fontWeight: "600",
  },
});
