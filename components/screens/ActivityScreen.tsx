import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityTimeline } from "@/components/ActivityTimeline";
import { AddEventBottomSheet } from "@/components/AddEventBottomSheet";
import { ThemedView } from "@/components/themed-view";
import { Fab } from "@/components/ux/Fab";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { MS_PER_MINUTE } from "@/utils/activityTime";

const TRANSLATE_PERCENT = 0.3;
const ANIMATION_ERROR_MARGIN = 0.75;

export function ActivityScreen() {
  const loadActivities = useActivityStore((s) => s.loadActivities);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleOpen = useCallback(() => {
    const now = new Date();
    const end = new Date(now.getTime() + 60 * MS_PER_MINUTE);
    useActivityEditStore.getState().openCreate(now, end);
  }, []);

  const bottomSheetAnimatedPosition = useSharedValue(0);
  const sheetMinPosition = useSharedValue(0);
  const sheetMaxPosition = useSharedValue(0);
  const timelineHeight = useSharedValue(0);

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
            <ActivityTimeline />
          </Animated.View>
          <Fab onPress={handleOpen} />
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
