import { StyleSheet, Text, View } from "react-native";

import { colors, textStyles } from "@/theme";

type InsightsChipProps = {
  label: string;
};

export function InsightsChip({ label }: InsightsChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.tint,
    borderRadius: 100,
    paddingHorizontal: 13,
    paddingVertical: 4,
    alignSelf: "center",
  },
  label: {
    ...textStyles.bodyMedium,
    color: "#fff",
  },
});
