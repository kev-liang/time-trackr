import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFocusEffect } from "expo-router";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ActivityTimeline,
  type ActivityTimelineHandle,
} from "@/components/activities/ActivityTimeline";
import { AddEventBottomSheet } from "@/components/activities/AddEventBottomSheet";
import { AddEventFAB } from "@/components/activities/AddEventFab";
import { TodayFAB } from "@/components/activities/TodayFAB";
import { ZoomControls } from "@/components/activities/ZoomControls";
import { ThemedView } from "@/components/themed-view";
import { LoadingScreen } from "@/components/ux/LoadingScreen";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityHistoryStore } from "@/stores/useActivityHistoryStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { spacing } from "@/theme";
import { MS_PER_MINUTE } from "@/utils/activityTime";

const TRANSLATE_PERCENT = 0.3;
const ANIMATION_ERROR_MARGIN = 0.75;

export function ActivityScreen() {
  const loadActivities = useActivityStore((s) => s.loadActivities);
  const activities = useActivityStore((s) => s.activities);
  const isLoading = useActivityStore((s) => s.isLoading);
  const loadItems = useActivityHistoryStore((s) => s.loadItems);
  const [calendarReady, setCalendarReady] = useState(false);
  const showLoading = isLoading || !calendarReady;

  useEffect(() => {
    loadActivities();
    loadItems();
  }, [loadActivities, loadItems]);

  const timelineRef = useRef<ActivityTimelineHandle>(null);
  const today = moment().local().format("YYYY-MM-DD");
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;

  const handleOpen = useCallback(() => {
    const start = isToday
      ? moment().local().toDate()
      : moment(selectedDate).local().startOf("day").add(12, "hours").toDate();
    const end = new Date(start.getTime() + 60 * MS_PER_MINUTE);
    useActivityEditStore.getState().openCreate(start, end);
  }, [isToday, selectedDate]);

  const handleGoToToday = useCallback(() => {
    timelineRef.current?.goToToday();
    setSelectedDate(moment().local().format("YYYY-MM-DD"));
  }, []);

  useFocusEffect(
    useCallback(() => {
      handleGoToToday();
    }, [handleGoToToday]),
  );

  const bottomSheetAnimatedPosition = useSharedValue(0);
  const sheetMinPosition = useSharedValue(0);
  const sheetMaxPosition = useSharedValue(0);
  const timelineHeight = useSharedValue(0);
  const [sheetTopY, setSheetTopY] = useState<number | null>(null);

  const handlePositionsCalculated = useCallback(
    (minPosition: number, maxPosition: number) => {
      sheetMinPosition.value = minPosition;
      sheetMaxPosition.value = maxPosition;
    },
    [sheetMinPosition, sheetMaxPosition],
  );

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const translateDistance = timelineHeight.value * TRANSLATE_PERCENT;
    const translateY =
      bottomSheetAnimatedPosition.value === 0
        ? 0
        : interpolate(
            bottomSheetAnimatedPosition.value,
            [
              sheetMaxPosition.value * ANIMATION_ERROR_MARGIN,
              sheetMinPosition.value,
            ],
            [0, -translateDistance],
            Extrapolation.CLAMP,
          );
    return { transform: [{ translateY }] };
  });

  return (
    <BottomSheetModalProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <Animated.View
            style={[styles.container, backgroundAnimatedStyle]}
            onLayout={(e) => {
              timelineHeight.value = e.nativeEvent.layout.height;
            }}
          >
            <ActivityTimeline
              ref={timelineRef}
              sheetTopY={sheetTopY}
              onDateChanged={(date) => {
                setSelectedDate(date.split("T")[0]);
              }}
              onLoad={() => setCalendarReady(true)}
            />
          </Animated.View>
          {showLoading && <LoadingScreen />}
          {!isToday && <TodayFAB onPress={handleGoToToday} />}
          <View style={styles.fabGroup}>
            <ZoomControls
              onZoomIn={() => timelineRef.current?.zoom({ scale: 1.3 })}
              onZoomOut={() => timelineRef.current?.zoom({ scale: 1 / 1.3 })}
            />
            <AddEventFAB onPress={handleOpen} />
          </View>
        </SafeAreaView>
      </ThemedView>
      <AddEventBottomSheet
        animatedPosition={bottomSheetAnimatedPosition}
        onPositionsCalculated={handlePositionsCalculated}
        onSheetWillOpen={setSheetTopY}
      />
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fabGroup: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
  },
});
