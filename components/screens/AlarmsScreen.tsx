import { ScrollView, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AlarmFrequencyInput } from "@/components/AlarmFrequencyInput";
import { AlarmMuteDropdown } from "@/components/AlarmMuteDropdown";
import { AlarmScheduleRow } from "@/components/AlarmScheduleRow";
import { ThemedView } from "@/components/themed-view";
import { AppText } from "@/components/ux/AppText";
import { useAlarmStore, WEEKDAYS } from "@/stores/useAlarmStore";
import { colors, spacing } from "@/theme";

export function AlarmsScreen() {
  const enabled = useAlarmStore((s) => s.enabled);
  const setEnabled = useAlarmStore((s) => s.setEnabled);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <View style={styles.row}>
              <AppText variant="bodySemiBold">Alarm</AppText>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                trackColor={{ true: colors.tint }}
              />
            </View>
          </View>

          <View style={styles.section}>
            <AlarmMuteDropdown />
          </View>

          <View style={styles.section}>
            <AlarmFrequencyInput />
          </View>

          <View style={styles.section}>
            <AppText variant="subtitle" style={styles.sectionTitle}>
              Schedule
            </AppText>
            {WEEKDAYS.map((day) => (
              <AlarmScheduleRow key={day} day={day} />
            ))}
          </View>
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
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
