import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import moment from "moment";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
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
import { ThemedView } from "@/components/themed-view";
import { LoadingScreen } from "@/components/ux/LoadingScreen";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityHistoryStore } from "@/stores/useActivityHistoryStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { MS_PER_MINUTE } from "@/utils/activityTime";

const TRANSLATE_PERCENT = 0.3;
const ANIMATION_ERROR_MARGIN = 0.75;

const CALENDAR_HEADER_HEIGHT = 52;

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
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const isToday = selectedDate === today;

  const handleOpen = useCallback(() => {
    const start = isToday
      ? new Date()
      : moment(selectedDate).startOf("day").add(12, "hours").toDate();
    const end = new Date(start.getTime() + 60 * MS_PER_MINUTE);
    useActivityEditStore.getState().openCreate(start, end);
  }, [isToday, selectedDate]);

  const handleGoToToday = useCallback(() => {
    timelineRef.current?.goToToday();
    setSelectedDate(new Date().toISOString().split("T")[0]);
  }, []);

  const bottomSheetAnimatedPosition = useSharedValue(0);
  const sheetMinPosition = useSharedValue(0);
  const sheetMaxPosition = useSharedValue(0);
  const timelineHeight = useSharedValue(0);

  const nowCardTop = useMemo(() => {
    const hourHeight = timelineRef.current?.getSizeByDuration(60)?.height ?? 60;
    return CALENDAR_HEADER_HEIGHT + (new Date().getMinutes() / 60) * hourHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timelineHeight.value]);

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
              sheetSnapHeight={300}
              onDateChanged={setSelectedDate}
              onLoad={() => setCalendarReady(true)}
            />
          </Animated.View>
          {showLoading && <LoadingScreen />}
          {!isToday && <TodayFAB onPress={handleGoToToday} />}
          <AddEventFAB onPress={handleOpen} />
        </SafeAreaView>
      </ThemedView>
      <AddEventBottomSheet
        animatedPosition={bottomSheetAnimatedPosition}
        onPositionsCalculated={handlePositionsCalculated}
      />
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

});
