import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors, textStyles } from "@/theme";

import { formatHourLabel, type HourSlot } from "./insightsUtils";

const BAR_MAX_HEIGHT = 120;
const BAR_WIDTH = 14;
const BAR_GAP = 3;

type Props = {
  slots: HourSlot[];
  highlightedTitles: Set<string> | null;
  setHighlightedTitles: (titles: Set<string> | null) => void;
  clearHighlight: () => void;
};

type BarProps = {
  slot: HourSlot;
  isHighlighted: boolean;
  isDimmed: boolean;
  highlightedTitles: Set<string> | null;
  onPress: () => void;
  onLongPress: () => void;
  clearHighlight: () => void;
};

function HourBar({ slot, isHighlighted, isDimmed, highlightedTitles, onPress, onLongPress, clearHighlight }: BarProps) {
  const longPressActive = useRef(false);
  const totalMinutes = slot.segments.reduce((s, seg) => s + seg.minutes, 0);
  const barHeight = Math.min((totalMinutes / 60) * BAR_MAX_HEIGHT, BAR_MAX_HEIGHT);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isDimmed ? 0.5 : 1, { duration: 150 }),
    transform: [
      { translateY: withSpring(isHighlighted ? -(barHeight * 0.1) : 0, { damping: 18, stiffness: 250 }) },
      { scaleY: withSpring(isHighlighted ? 1.2 : 1, { damping: 18, stiffness: 250 }) },
      { scaleX: withSpring(isHighlighted ? 1.2 : 1, { damping: 18, stiffness: 250 }) },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => { longPressActive.current = true; onLongPress(); }}
      onPressOut={() => { if (longPressActive.current) { longPressActive.current = false; clearHighlight(); } }}
      hitSlop={{ top: 16, bottom: 16 }}
      style={styles.barWrapper}
    >
      <View style={[styles.barContainer, { height: BAR_MAX_HEIGHT }]}>
        {slot.hour % 3 === 0 && <View style={styles.tickLine} />}
        <Animated.View style={[styles.bar, { height: barHeight }, animatedStyle]}>
          {[...slot.segments].reverse().map((seg, i) => {
            const segHeight = (seg.minutes / 60) * BAR_MAX_HEIGHT;
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
  );
}

export function HourlyBarChart({ slots, highlightedTitles, setHighlightedTitles, clearHighlight }: Props) {
  return (
    <View>
      <View style={styles.barsRow}>
        {slots.map((slot) => {
          const titlesInBar = new Set(slot.segments.map((s) => s.title));
          const isHighlighted =
            highlightedTitles !== null &&
            [...highlightedTitles].some((t) => titlesInBar.has(t));
          const isDimmed = highlightedTitles !== null && !isHighlighted;
          return (
            <HourBar
              key={slot.hour}
              slot={slot}
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
