import { Keyboard, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { TimeSpinnerPicker } from "@/components/ux/TimeSpinnerPicker";
import { colors, spacing } from "@/theme";

function formatTimeDisplay(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${period}`;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface TimePickerRowProps {
  label: string;
  time: Date;
  isOpen: boolean;
  hasError: boolean;
  resetKey: number;
  onToggle: () => void;
  onChange: (date: Date) => void;
}

export function TimePickerRow({
  label,
  time,
  isOpen,
  hasError,
  resetKey,
  onToggle,
  onChange,
}: TimePickerRowProps) {
  return (
    <>
      <View style={styles.timeRow}>
        <AppText variant="body" color={colors.textSecondary}>
          {label}
        </AppText>
        <View style={styles.timeButtonGroup}>
          <AppText variant="bodySemiBold" color={colors.textSecondary}>
            {formatDateDisplay(time)}
          </AppText>
          <Pressable style={styles.timeButton} onPress={() => { Keyboard.dismiss(); onToggle(); }}>
            <AppText
              variant="bodySemiBold"
              color={hasError ? "#EF4444" : undefined}
            >
              {formatTimeDisplay(time)}
            </AppText>
          </Pressable>
        </View>
      </View>
      {isOpen && (
        <View style={styles.inlinePicker}>
          <TimeSpinnerPicker
            key={`${label}-${resetKey}`}
            value={time}
            minuteInterval={5}
            onChange={onChange}
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  timeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  timeButtonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  inlinePicker: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});
