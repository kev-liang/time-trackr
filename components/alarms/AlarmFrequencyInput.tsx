import { useCallback } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

import { AppText } from "@/components/ux/AppText";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { colors, fonts, spacing } from "@/theme";

const UNIT_OPTIONS = [
  { label: "minutes", value: "minutes" as const },
  { label: "hours", value: "hours" as const },
];

export function AlarmFrequencyInput() {
  const enabled = useAlarmStore((s) => s.enabled);
  const frequency = useAlarmStore((s) => s.frequency);
  const frequencyUnit = useAlarmStore((s) => s.frequencyUnit);
  const setFrequencyValue = useAlarmStore((s) => s.setFrequencyValue);
  const setFrequencyUnit = useAlarmStore((s) => s.setFrequencyUnit);

  const handleValueChange = useCallback(
    (text: string) => {
      const num = parseInt(text, 10);
      if (!isNaN(num) && num > 0) {
        setFrequencyValue(num);
      } else if (text === "") {
        setFrequencyValue(0);
      }
    },
    [setFrequencyValue],
  );

  const handleBlur = useCallback(() => {
    if (frequency < 1) setFrequencyValue(1);
  }, [frequency, setFrequencyValue]);

  const handleUnitChange = useCallback(
    (item: { value: "minutes" | "hours" }) => {
      setFrequencyUnit(item.value);
    },
    [setFrequencyUnit],
  );

  return (
    <View style={styles.container}>
      <AppText variant="bodySemiBold">Every</AppText>
      <TextInput
        style={[styles.numberInput, !enabled && styles.inputDisabled]}
        value={frequency > 0 ? frequency.toString() : ""}
        onChangeText={handleValueChange}
        onBlur={handleBlur}
        keyboardType="number-pad"
        placeholder="30"
        placeholderTextColor={colors.textSecondary}
        editable={enabled}
      />
      <Dropdown
        style={styles.dropdown}
        selectedTextStyle={[styles.selectedText, !enabled && styles.textDisabled]}
        itemTextStyle={styles.itemText}
        data={UNIT_OPTIONS}
        labelField="label"
        valueField="value"
        value={frequencyUnit}
        onChange={handleUnitChange}
        disable={!enabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  numberInput: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
    width: 64,
    textAlign: "center",
  },
  inputDisabled: {
    color: colors.textSecondary,
  },
  textDisabled: {
    color: colors.textSecondary,
  },
  dropdown: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
  },
  selectedText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  itemText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
});
