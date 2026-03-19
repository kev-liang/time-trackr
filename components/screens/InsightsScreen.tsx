import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyInsights } from "@/components/insights/EmptyInsights";
import { HourlyBarChart } from "@/components/insights/HourlyBarChart";
import { InsightList } from "@/components/insights/InsightList";
import { InsightsChip } from "@/components/insights/InsightsChip";
import { PeriodToggle } from "@/components/insights/PeriodToggle";
import { WeeklyBarChart } from "@/components/insights/WeeklyBarChart";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ux/Card";
import { useInsightsData, useInsightsStore } from "@/stores/useInsightsStore";
import { colors, spacing, textStyles } from "@/theme";

const SLIDE_DISTANCE = 350;

export function InsightsScreen() {
  const { period, setPeriod, goToPrev, goToNext, setSelectedDate } =
    useInsightsStore();
  const [highlightedTitles, setHighlightedTitles] = useState<Set<string> | null>(null);
  const clearHighlight = useCallback(() => setHighlightedTitles(null), []);

  const translateX = useSharedValue(0);

  // Runs on JS thread — update data immediately then slide new content in
  const navigate = useCallback(
    (direction: "next" | "prev") => {
      const outX = direction === "next" ? -SLIDE_DISTANCE : SLIDE_DISTANCE;
      const inX = direction === "next" ? SLIDE_DISTANCE : -SLIDE_DISTANCE;
      const action = direction === "next" ? goToNext : goToPrev;
      translateX.value = withTiming(outX, { duration: 180, easing: Easing.in(Easing.cubic) });
      setTimeout(() => {
        action();
        translateX.value = inX;
        requestAnimationFrame(() => {
          translateX.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.cubic) });
        });
      }, 180);
    },
    [goToNext, goToPrev, translateX],
  );

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .runOnJS(true)
    .onEnd((e) => {
      if (e.translationX < -50) {
        navigate("next");
      } else if (e.translationX > 50) {
        navigate("prev");
      }
    });

  useFocusEffect(
    useCallback(() => {
      setSelectedDate(new Date());
    }, [setSelectedDate]),
  );

  const {
    hourSlots,
    daySlots,
    maxMinutes,
    todayDayIndex,
    isEmpty,
    dateTitle,
    activityTotals,
    isToday,
  } = useInsightsData();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <GestureDetector gesture={swipeGesture}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <PeriodToggle value={period} onChange={(p) => { clearHighlight(); setPeriod(p); }} />

            <View style={styles.slideClip}>
            <Animated.View style={[styles.animatedContent, animatedStyle]}>
              <View style={styles.dateNav}>
                <TouchableOpacity onPress={() => navigate("prev")}>
                  <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.dateTitleContainer}>
                  <Text style={styles.dateTitle}>{dateTitle}</Text>
                  {isToday && <InsightsChip label="Today" />}
                </View>
                <TouchableOpacity onPress={() => navigate("next")}>
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
                      highlightedTitles={highlightedTitles}
                      setHighlightedTitles={setHighlightedTitles}
                      clearHighlight={clearHighlight}
                    />
                  ) : (
                    <HourlyBarChart
                      slots={hourSlots}
                      highlightedTitles={highlightedTitles}
                      setHighlightedTitles={setHighlightedTitles}
                      clearHighlight={clearHighlight}
                    />
                  )}

                  <Card title="Activities">
                    <InsightList
                      items={activityTotals}
                      highlightedTitles={highlightedTitles}
                      setHighlightedTitles={setHighlightedTitles}
                      clearHighlight={clearHighlight}
                    />
                  </Card>
                </>
              )}
            </Animated.View>
            </View>
          </ScrollView>
        </GestureDetector>
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
  slideClip: {
    overflow: "hidden",
  },
  animatedContent: {
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
  dateTitleContainer: {
    alignItems: "center",
    gap: 8,
  },
});
