import { Modal, Pressable, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppText } from "@/components/ux/AppText";
import { TimeSpinnerPicker } from "@/components/ux/TimeSpinnerPicker";
import { colors, spacing } from "@/theme";

type TimePickerModalProps = {
  visible: boolean;
  title: string;
  value: Date;
  resetKey?: number;
  onChange: (date: Date) => void;
  onClose: () => void;
};

export function TimePickerModal({
  visible,
  title,
  value,
  resetKey,
  onChange,
  onClose,
}: TimePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.gestureRoot}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
          <View style={styles.card}>
            <View style={styles.header}>
              <AppText variant="bodySemiBold">{title}</AppText>
              <Pressable onPress={onClose} hitSlop={12}>
                <AppText variant="bodySemiBold" color={colors.tint}>
                  Done
                </AppText>
              </Pressable>
            </View>
            <TimeSpinnerPicker
              key={resetKey}
              value={value}
              minuteInterval={5}
              onChange={onChange}
            />
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
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
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
