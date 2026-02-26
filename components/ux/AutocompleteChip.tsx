import { Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { colors, spacing } from "@/theme";

type ChipItem = {
  label: string;
  color?: string;
};

type AutocompleteChipProps = {
  item: ChipItem;
  onRemove: () => void;
};

export function AutocompleteChip({ item, onRemove }: AutocompleteChipProps) {
  const chipColor = item.color ?? colors.tint;

  return (
    <Pressable
      style={[styles.chip, { backgroundColor: chipColor }]}
      onPress={onRemove}
      hitSlop={4}
    >
      <AppText variant="body" color="#fff">
        {item.label}
      </AppText>
      <AppText variant="body" color="rgba(255,255,255,0.75)">
        {" ×"}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
});
