import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyInsights } from "@/components/insights/EmptyInsights";
import { HourlyBarChart } from "@/components/insights/HourlyBarChart";
import { InsightList } from "@/components/insights/InsightList";
import { PeriodToggle, type Period } from "@/components/insights/PeriodToggle";
import {
  buildActivityTotals,
  buildHourSlots,
  formatDateTitle,
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

  const isEmpty = todayActivities.length === 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <PeriodToggle value={period} onChange={setPeriod} />

          <Text style={styles.dateTitle}>{formatDateTitle(new Date())}</Text>

          {isEmpty ? (
            <EmptyInsights />
          ) : (
            <>
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
  dateTitle: {
    ...textStyles.title,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
