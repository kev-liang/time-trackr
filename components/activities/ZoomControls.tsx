import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors, spacing } from "@/theme";

type ZoomControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={onZoomIn}
        hitSlop={4}
      >
        <MaterialIcons name="zoom-in" size={22} color={colors.text} />
      </Pressable>
      <View style={styles.divider} />
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={onZoomOut}
        hitSlop={4}
      >
        <MaterialIcons name="zoom-out" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: spacing.lg + 56 + spacing.md,
    right: spacing.lg - (56 - 44) / 2,
    width: 44,
    backgroundColor: colors.background,
    borderRadius: 22,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  button: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: colors.border,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
});
