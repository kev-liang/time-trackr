import { type ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { spacing } from "@/theme";

type ChipProps = {
  label: string;
  color: string;
  onPress?: () => void;
  rightComponent?: ReactNode;
};

export function Chip({ label, color, onPress, rightComponent }: ChipProps) {
  return (
    <Pressable
      style={[styles.chip, { backgroundColor: color }]}
      onPress={onPress}
      hitSlop={onPress ? 4 : undefined}
      disabled={!onPress}
    >
      <AppText variant="body" color="#fff">
        {label}
      </AppText>
      {rightComponent}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
});
