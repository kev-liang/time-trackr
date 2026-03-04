import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyInsights } from "@/components/insights/EmptyInsights";
import { HourlyBarChart } from "@/components/insights/HourlyBarChart";
import { InsightList } from "@/components/insights/InsightList";
import { PeriodToggle, type Period } from "@/components/insights/PeriodToggle";
import { Card } from "@/components/ux/Card";
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
  const [selectedDate, setSelectedDate] = useState(new Date());

  const goToPrev = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const goToNext = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const todayActivities = useMemo(() => {
    const dateStr = selectedDate.toDateString();
    return activities.filter(
      (a) => new Date(a.start).toDateString() === dateStr,
    );
  }, [activities, selectedDate]);

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

          <View style={styles.dateNav}>
            <TouchableOpacity onPress={goToPrev}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.dateTitle}>{formatDateTitle(selectedDate)}</Text>
            <TouchableOpacity onPress={goToNext}>
              <Ionicons name="chevron-forward" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {isEmpty ? (
            <EmptyInsights />
          ) : (
            <>
              <HourlyBarChart slots={hourSlots} />

              <Card title="Activities">
                <InsightList items={activityTotals} />
              </Card>
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
  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
