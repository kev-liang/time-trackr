import { MaterialCommunityIcons } from "@expo/vector-icons";
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
        <MaterialCommunityIcons
          name="magnify-plus"
          size={26}
          color={colors.icon}
        />
      </Pressable>
      <View style={styles.divider} />
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={onZoomOut}
        hitSlop={4}
      >
        <MaterialCommunityIcons
          name="magnify-minus"
          size={26}
          color={colors.icon}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 52,
    backgroundColor: colors.background,
    borderRadius: 26,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  button: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: colors.border,
  },
  divider: {
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
});
