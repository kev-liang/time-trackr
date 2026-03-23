import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { colors, spacing } from "@/theme";

interface EventSheetHeaderProps {
  isEditing: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onSave: () => void;
}

export function EventSheetHeader({
  isEditing,
  onCancel,
  onDelete,
  onSave,
}: EventSheetHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onCancel}>
        <AppText variant="body" color={colors.tint}>
          Cancel
        </AppText>
      </Pressable>
      <AppText variant="bodySemiBold">
        {isEditing ? "Edit Activity" : "Add Activity"}
      </AppText>
      <View style={styles.headerActions}>
        {isEditing && (
          <Pressable onPress={onDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
          </Pressable>
        )}
        <Pressable onPress={onSave} hitSlop={8}>
          <Ionicons name="save-outline" size={24} color={colors.tint} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
});
