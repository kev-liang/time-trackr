import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, textStyles } from "@/theme";

import { formatDuration, type ActivityTotal } from "./insightsUtils";

type Props = {
  items: ActivityTotal[];
};

export function InsightList({ items }: Props) {
  return (
    <View style={styles.list}>
      {items.map((a) => (
        <View key={a.title} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: a.color }]} />
          <Text style={styles.title} numberOfLines={1}>{a.title}</Text>
          <Text style={styles.duration}>{formatDuration(a.minutes)}</Text>
        </View>
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
    width: 10,
    height: 10,
    borderRadius: 5,
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
