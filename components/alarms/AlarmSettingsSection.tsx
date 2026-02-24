import { AlarmMuteDropdown } from "@/components/alarms/AlarmMuteDropdown";
import { NextAlarmDisplay } from "@/components/alarms/NextAlarmDisplay";
import { AppText } from "@/components/ux/AppText";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { colors, spacing } from "@/theme";
import { StyleSheet, Switch, View } from "react-native";

export function AlarmSettingsSection() {
  const enabled = useAlarmStore((s) => s.enabled);
  const setEnabled = useAlarmStore((s) => s.setEnabled);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <AppText variant="bodySemiBold">Enabled</AppText>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ true: colors.tint }}
        />
      </View>
      <NextAlarmDisplay />
      {/* <View style={styles.divider} /> */}
      <View style={styles.muteAlarmContainer}>
        <AlarmMuteDropdown />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  muteAlarmContainer: {
    marginTop: spacing.sm,
  },
});
