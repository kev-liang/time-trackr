import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing, textStyles } from "@/theme";

export type Period = "day" | "week";

type Props = {
  value: Period;
  onChange: (period: Period) => void;
};

export function PeriodToggle({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.pill, value === "day" && styles.pillActive]}
        onPress={() => onChange("day")}
      >
        <Text style={[styles.text, value === "day" && styles.textActive]}>
          Day
        </Text>
      </Pressable>
      <Pressable
        style={[styles.pill, value === "week" && styles.pillActive]}
        onPress={() => onChange("week")}
      >
        <Text style={[styles.text, value === "week" && styles.textActive]}>Week</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    borderRadius: 8,
  },
  pillActive: {
    backgroundColor: colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    ...textStyles.bodySemiBold,
    color: colors.textSecondary,
  },
  textActive: {
    color: colors.text,
  },
});
