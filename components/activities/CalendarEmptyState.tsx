import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { colors, spacing, textStyles } from "@/theme";

type Props = {
  onDismiss: () => void;
  style?: StyleProp<ViewStyle>;
};

export function CalendarEmptyState({ onDismiss, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Pressable style={styles.closeButton} onPress={onDismiss} hitSlop={8}>
        <Ionicons name="close" size={18} color={colors.icon} />
      </Pressable>
      <Text style={styles.text}>
        Long-press anywhere on the calendar to add an activity
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.xl + spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  closeButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
  },
  text: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
});
