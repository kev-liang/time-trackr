import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyInsights } from "@/components/insights/EmptyInsights";
import { HourlyBarChart } from "@/components/insights/HourlyBarChart";
import { InsightList } from "@/components/insights/InsightList";
import { PeriodToggle, type Period } from "@/components/insights/PeriodToggle";
import { WeeklyBarChart } from "@/components/insights/WeeklyBarChart";
import { Card } from "@/components/ux/Card";
import {
  buildActivityTotals,
  buildDaySlots,
  buildHourSlots,
  formatDateTitle,
  formatWeekTitle,
  getWeekStart,
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
    d.setDate(d.getDate() - (period === "week" ? 7 : 1));
    setSelectedDate(d);
  };

  const goToNext = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (period === "week" ? 7 : 1));
    setSelectedDate(d);
  };

  // --- Day view ---
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

  const dayActivityTotals = useMemo(
    () => buildActivityTotals(todayActivities),
    [todayActivities],
  );

  // --- Week view ---
  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);

  const weekActivities = useMemo(() => {
    const weekEndMs = new Date(weekStart);
    weekEndMs.setDate(weekEndMs.getDate() + 6);
    weekEndMs.setHours(23, 59, 59, 999);
    return activities.filter((a) => {
      const start = new Date(a.start);
      return start >= weekStart && start <= weekEndMs;
    });
  }, [activities, weekStart]);

  const daySlots = useMemo(
    () => buildDaySlots(weekStart, weekActivities),
    [weekStart, weekActivities],
  );

  const maxMinutes = useMemo(() => {
    const totals = daySlots.map((s) =>
      s.segments.reduce((sum, seg) => sum + seg.minutes, 0),
    );
    return Math.max(0, ...totals);
  }, [daySlots]);

  const weekActivityTotals = useMemo(
    () => buildActivityTotals(weekActivities),
    [weekActivities],
  );

  const todayDayIndex = useMemo(() => {
    const today = new Date();
    const todayWeekStart = getWeekStart(today);
    if (todayWeekStart.getTime() === weekStart.getTime()) {
      const day = today.getDay(); // 0=Sun
      return day === 0 ? 6 : day - 1; // Mon=0 ... Sun=6
    }
    return null;
  }, [weekStart]);

  // --- Derived ---
  const isEmpty =
    period === "day" ? todayActivities.length === 0 : weekActivities.length === 0;

  const dateTitle =
    period === "week" ? formatWeekTitle(weekStart) : formatDateTitle(selectedDate);

  const activityTotals = period === "week" ? weekActivityTotals : dayActivityTotals;

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
            <Text style={styles.dateTitle}>{dateTitle}</Text>
            <TouchableOpacity onPress={goToNext}>
              <Ionicons name="chevron-forward" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {isEmpty ? (
            <EmptyInsights />
          ) : (
            <>
              {period === "week" ? (
                <WeeklyBarChart
                  slots={daySlots}
                  maxMinutes={maxMinutes}
                  todayDayIndex={todayDayIndex}
                />
              ) : (
                <HourlyBarChart slots={hourSlots} />
              )}

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
