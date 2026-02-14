import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import moment from "moment";

import { AppText } from "@/components/ux/AppText";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { colors, fonts, spacing } from "@/theme";

const MUTE_OPTIONS = [
  { label: "Not muted", value: "none" },
  { label: "15 minutes", value: "15m" },
  { label: "30 minutes", value: "30m" },
  { label: "1 hour", value: "1h" },
  { label: "Until next day", value: "next_day" },
  { label: "Until I turn it on", value: "indefinite" },
];

export function AlarmMuteDropdown() {
  const mutedUntil = useAlarmStore((s) => s.mutedUntil);
  const enabled = useAlarmStore((s) => s.enabled);
  const muteUntil = useAlarmStore((s) => s.muteUntil);
  const setEnabled = useAlarmStore((s) => s.setEnabled);

  const currentValue = !enabled
    ? "indefinite"
    : mutedUntil
      ? "custom"
      : "none";

  const handleChange = useCallback(
    (item: { value: string }) => {
      switch (item.value) {
        case "none":
          muteUntil(null);
          setEnabled(true);
          break;
        case "15m":
          muteUntil(moment().add(15, "minutes").toISOString());
          setEnabled(true);
          break;
        case "30m":
          muteUntil(moment().add(30, "minutes").toISOString());
          setEnabled(true);
          break;
        case "1h":
          muteUntil(moment().add(1, "hour").toISOString());
          setEnabled(true);
          break;
        case "next_day":
          muteUntil(
            moment().add(1, "day").startOf("day").toISOString(),
          );
          setEnabled(true);
          break;
        case "indefinite":
          muteUntil(null);
          setEnabled(false);
          break;
      }
    },
    [muteUntil, setEnabled],
  );

  return (
    <View style={styles.container}>
      <AppText variant="bodySemiBold">Mute</AppText>
      <Dropdown
        style={styles.dropdown}
        selectedTextStyle={styles.selectedText}
        itemTextStyle={styles.itemText}
        data={MUTE_OPTIONS}
        labelField="label"
        valueField="value"
        value={currentValue}
        onChange={handleChange}
        placeholder="Select..."
        placeholderStyle={styles.placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
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
  placeholder: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
