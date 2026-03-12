import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/theme";

type Props = {
  count: number;
  activeIndex: number;
};

const DOT_SIZE = 8;
const ACTIVE_WIDTH = 24;
const TIMING_MS = 200;

function Dot({ active }: { active: boolean }) {
  const style = useAnimatedStyle(() => ({
    width: withTiming(active ? ACTIVE_WIDTH : DOT_SIZE, { duration: TIMING_MS }),
    backgroundColor: withTiming(active ? colors.tint : colors.border, {
      duration: TIMING_MS,
    }),
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function PaginationDots({ count, activeIndex }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} active={i === activeIndex} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
