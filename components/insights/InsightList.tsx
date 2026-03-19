import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors, spacing, textStyles } from "@/theme";

import { formatDuration, type ActivityTotal } from "./insightsUtils";

type Props = {
  items: ActivityTotal[];
  highlightedTitles: Set<string> | null;
  setHighlightedTitles: (titles: Set<string> | null) => void;
  clearHighlight: () => void;
};

type ItemProps = {
  item: ActivityTotal;
  isHighlighted: boolean;
  isDimmed: boolean;
  onPress: () => void;
  onLongPress: () => void;
  clearHighlight: () => void;
};

function InsightListItem({ item, isHighlighted, isDimmed, onPress, onLongPress, clearHighlight }: ItemProps) {
  const longPressActive = useRef(false);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isDimmed ? 0.5 : 1, { duration: 150 }),
    transform: [{ scale: withSpring(isHighlighted ? 1.05 : 1, { damping: 18, stiffness: 250 }) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => { longPressActive.current = true; onLongPress(); }}
      onPressOut={() => { if (longPressActive.current) { longPressActive.current = false; clearHighlight(); } }}
    >
      <Animated.View style={[styles.row, animatedStyle]}>
        <View style={[styles.dot, { backgroundColor: item.color, width: isHighlighted ? 5 : 3 }]} />
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.duration}>{formatDuration(item.minutes)}</Text>
      </Animated.View>
    </Pressable>
  );
}

export function InsightList({ items, highlightedTitles, setHighlightedTitles, clearHighlight }: Props) {
  return (
    <View style={styles.list}>
      {items.map((a) => {
        const isHighlighted = highlightedTitles !== null && highlightedTitles.has(a.title);
        return (
          <InsightListItem
            key={a.title}
            item={a}
            isHighlighted={isHighlighted}
            isDimmed={highlightedTitles !== null && !highlightedTitles.has(a.title)}
            onPress={() => isHighlighted ? clearHighlight() : setHighlightedTitles(new Set([a.title]))}
            onLongPress={() => setHighlightedTitles(new Set([a.title]))}
            clearHighlight={clearHighlight}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 3,
    height: 20,
    borderRadius: 2,
  },
  title: {
    ...textStyles.body,
    color: colors.text,
    flex: 1,
  },
  duration: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
});
