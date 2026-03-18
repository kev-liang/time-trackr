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

type EditActivityModalProps = {
  visible: boolean;
  initialName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
};

export function EditActivityModal({
  visible,
  initialName,
  onConfirm,
  onCancel,
}: EditActivityModalProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (visible) setName(initialName);
  }, [visible, initialName]);

  const canSubmit = name.trim().length > 0 && name.trim() !== initialName;

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
            onSubmitEditing={() => canSubmit && onConfirm(name.trim())}
          />

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
              onPress={() => canSubmit && onConfirm(name.trim())}
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
