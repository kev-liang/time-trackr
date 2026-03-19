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
  onLongPress: () => void;
  onPressOut: () => void;
};

function InsightListItem({ item, isHighlighted, isDimmed, onLongPress, onPressOut }: ItemProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isDimmed ? 0.25 : 1, { duration: 150 }),
    transform: [{ scale: withSpring(isHighlighted ? 1.05 : 1, { damping: 18, stiffness: 250 }) }],
  }));

  return (
    <Pressable onLongPress={onLongPress} onPressOut={onPressOut}>
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
      {items.map((a) => (
        <InsightListItem
          key={a.title}
          item={a}
          isHighlighted={highlightedTitles !== null && highlightedTitles.has(a.title)}
          isDimmed={highlightedTitles !== null && !highlightedTitles.has(a.title)}
          onLongPress={() => setHighlightedTitles(new Set([a.title]))}
          onPressOut={clearHighlight}
        />
      ))}
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
