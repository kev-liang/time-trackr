import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { AppText } from "@/components/ux/AppText";
import { colors, fonts, spacing } from "@/theme";
import { ACTIVITY_COLORS } from "@/utils/consts";

const COLOR_SWATCHES = Object.values(ACTIVITY_COLORS);

type EditActivityModalProps = {
  visible: boolean;
  initialName: string;
  initialColor?: string;
  onConfirm: (newName: string, newColor: string) => void;
  onCancel: () => void;
};

export function EditActivityModal({
  visible,
  initialName,
  initialColor,
  onConfirm,
  onCancel,
}: EditActivityModalProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor ?? COLOR_SWATCHES[0]);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setColor(initialColor ?? COLOR_SWATCHES[0]);
    }
  }, [visible, initialName, initialColor]);

  const nameChanged = name.trim().length > 0 && name.trim() !== initialName;
  const colorChanged = color !== initialColor;
  const canSubmit = name.trim().length > 0 && (nameChanged || colorChanged);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onCancel} />
        <View style={styles.card}>
          <View style={styles.header}>
            <AppText variant="bodySemiBold">Edit Activity</AppText>
            <Pressable onPress={onCancel} hitSlop={12}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.warningSection}>
            <AppText
              variant="body"
              color="textSecondary"
              style={styles.warningText}
            >
              Editing this activity will change past activities in the Calendar
              and Insights tab.
            </AppText>
          </View>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoFocus
            selectTextOnFocus
            onSubmitEditing={() => canSubmit && onConfirm(name.trim(), color)}
          />

          <View style={styles.swatchRow}>
            {COLOR_SWATCHES.map((swatchColor) => {
              const isSelected = color === swatchColor;
              return (
                <Pressable
                  key={swatchColor}
                  hitSlop={6}
                  onPress={() => setColor(swatchColor)}
                  style={[
                    styles.swatchOuter,
                    isSelected && { borderColor: swatchColor },
                  ]}
                >
                  <View style={[styles.swatchInner, { backgroundColor: swatchColor }]} />
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <AppText variant="bodySemiBold" color="textSecondary">
                Cancel
              </AppText>
            </Pressable>
            <Pressable
              style={[
                styles.confirmButton,
                !canSubmit && styles.confirmButtonDisabled,
              ]}
              onPress={() => canSubmit && onConfirm(name.trim(), color)}
            >
              <AppText variant="bodySemiBold" style={{ color: colors.background }}>
                Edit
              </AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 300,
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  warningSection: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  warningText: {
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  swatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  swatchOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  swatchInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.tint,
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
});
