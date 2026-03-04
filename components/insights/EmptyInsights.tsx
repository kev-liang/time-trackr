import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, textStyles } from "@/theme";

export function EmptyInsights() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No activities logged today</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  text: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
});
