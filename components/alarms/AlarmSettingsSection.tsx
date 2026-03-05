import { AlarmMuteDropdown } from "@/components/alarms/AlarmMuteDropdown";
import { NextAlarmDisplay } from "@/components/alarms/NextAlarmDisplay";
import { AppText } from "@/components/ux/AppText";
import { Toggle } from "@/components/ux/Toggle";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { spacing } from "@/theme";
import { StyleSheet, View } from "react-native";

export function AlarmSettingsSection() {
  const enabled = useAlarmStore((s) => s.enabled);
  const setEnabled = useAlarmStore((s) => s.setEnabled);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <AppText variant="bodySemiBold">Enabled</AppText>
        <Toggle value={enabled} onValueChange={setEnabled} />
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
