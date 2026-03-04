import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HourlyBarChart } from "@/components/insights/HourlyBarChart";
import { InsightList } from "@/components/insights/InsightList";
import { PeriodToggle, type Period } from "@/components/insights/PeriodToggle";
import {
  buildActivityTotals,
  buildHourSlots,
  formatDuration,
} from "@/components/insights/insightsUtils";
import { ThemedView } from "@/components/themed-view";
import { useActivityStore } from "@/stores/useActivityStore";
import { colors, spacing, textStyles } from "@/theme";

export function InsightsScreen() {
  const activities = useActivityStore((s) => s.activities);
  const [period, setPeriod] = useState<Period>("day");

  const todayActivities = useMemo(() => {
    const todayStr = new Date().toDateString();
    return activities.filter(
      (a) => new Date(a.start).toDateString() === todayStr,
    );
  }, [activities]);

  const hourSlots = useMemo(
    () => buildHourSlots(todayActivities),
    [todayActivities],
  );

  const activityTotals = useMemo(
    () => buildActivityTotals(todayActivities),
    [todayActivities],
  );

  const totalMinutes = useMemo(
    () => activityTotals.reduce((s, a) => s + a.minutes, 0),
    [activityTotals],
  );

  const isEmpty = todayActivities.length === 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <PeriodToggle value={period} onChange={setPeriod} />

          {isEmpty ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No activities logged today</Text>
            </View>
          ) : (
            <>
              <View style={styles.heroRow}>
                <Text style={styles.heroTime}>{formatDuration(totalMinutes)}</Text>
                <Text style={styles.heroLabel}>Today</Text>
              </View>

              <HourlyBarChart slots={hourSlots} />

              <View style={styles.divider} />

              <InsightList items={activityTotals} />
            </>
          )}
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
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  heroRow: {
    gap: 2,
  },
  heroTime: {
    ...textStyles.title,
    color: colors.text,
  },
  heroLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyState: {
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
});
