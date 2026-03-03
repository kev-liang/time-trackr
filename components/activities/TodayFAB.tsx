import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { colors, spacing } from "@/theme";

type TodayFABProps = {
  onPress: () => void;
};

export function TodayFAB({ onPress }: TodayFABProps) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Ionicons name="chevron-back" size={20} color={colors.text} />
      <AppText variant="bodySemiBold" color={colors.text}>
        Today
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 22,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
