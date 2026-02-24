import { ScrollView, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AlarmFrequencyInput } from "@/components/alarms/AlarmFrequencyInput";
import { AlarmMuteDropdown } from "@/components/alarms/AlarmMuteDropdown";
import { AlarmScheduleCard } from "@/components/alarms/AlarmScheduleCard";
import { NextAlarmDisplay } from "@/components/alarms/NextAlarmDisplay";
import { ThemedView } from "@/components/themed-view";
import { AppText } from "@/components/ux/AppText";
import { Card } from "@/components/ux/Card";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { colors, spacing } from "@/theme";

export function AlarmsScreen() {
  const enabled = useAlarmStore((s) => s.enabled);
  const setEnabled = useAlarmStore((s) => s.setEnabled);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <AppText variant="title">Notifications</AppText>

          <Card>
            <View style={styles.row}>
              <AppText variant="bodySemiBold">Enabled</AppText>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                trackColor={{ true: colors.tint }}
              />
            </View>
            <NextAlarmDisplay />
            <View style={styles.divider} />
            <AlarmMuteDropdown />
          </Card>

          <Card title="Frequency">
            <AlarmFrequencyInput />
          </Card>

          <AlarmScheduleCard />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
