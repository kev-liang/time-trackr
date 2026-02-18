import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { AppText } from "@/components/ux/AppText";
import { useActivityStore } from "@/stores/useActivityStore";
import { colors } from "@/theme";
import {
  MIN_HEIGHT_FOR_TIME,
  SNAP_INTERVAL_MINUTES,
  applyDragDeltas,
  durationMinutes,
} from "@/utils/activityTime";
import { lighten } from "@/utils/colors";
import { formatTime } from "@/utils/time";

type ActivityTimelineEventEditProps = {
  id?: string;
  title: string;
  start: string;
  end: string;
  color: string;
  height: number;
  textColor: string;
  secondaryTextColor: string;
};

export const ActivityTimelineEventEdit = memo(
  function ActivityTimelineEventEdit({
    id,
    title,
    start,
    end,
    color,
    height,
    textColor,
    secondaryTextColor,
  }: ActivityTimelineEventEditProps) {
    const showTime = height > MIN_HEIGHT_FOR_TIME;

    const topOffset = useSharedValue(0);
    const bottomOffset = useSharedValue(0);

    const pixelsPerMinute = height / durationMinutes(start, end);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const applyDrag = useCallback(
      (deltaStartMin: number, deltaEndMin: number) => {
        if (!id) return;
        const activities = useActivityStore.getState().activities;
        const event = activities.find((a) => a.id === id);
        if (!event) return;
        const updates = applyDragDeltas(event, deltaStartMin, deltaEndMin);
        if (Object.keys(updates).length > 0) {
          useActivityStore.getState().updateActivity(id, updates);
        }
      },
      [id],
    );

    const debouncedDrag = useCallback(
      (deltaStartMin: number, deltaEndMin: number) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
          applyDrag(deltaStartMin, deltaEndMin);
        }, 200);
      },
      [applyDrag],
    );

    const snapToMinutes = (px: number) =>
      Math.round(px / pixelsPerMinute / SNAP_INTERVAL_MINUTES) *
      SNAP_INTERVAL_MINUTES;

    const topGesture = Gesture.Pan()
      .runOnJS(true)
      .onUpdate((e) => {
        topOffset.value = e.translationY;
        debouncedDrag(snapToMinutes(e.translationY), 0);
      })
      .onEnd(() => {
        const deltaMinutes = snapToMinutes(topOffset.value);
        topOffset.value = 0;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        applyDrag(deltaMinutes, 0);
      });

    const bottomGesture = Gesture.Pan()
      .runOnJS(true)
      .onUpdate((e) => {
        bottomOffset.value = e.translationY;
        debouncedDrag(0, snapToMinutes(e.translationY));
      })
      .onEnd(() => {
        const deltaMinutes = snapToMinutes(bottomOffset.value);
        bottomOffset.value = 0;
        applyDrag(0, deltaMinutes);
      });

    const animatedContainerStyle = useAnimatedStyle(() => ({
      height: height + bottomOffset.value - topOffset.value,
      transform: [{ translateY: topOffset.value }],
    }));

    return (
      <Animated.View style={[{ width: "100%" }, animatedContainerStyle]}>
        <GestureDetector gesture={topGesture}>
          <Animated.View style={styles.handle}>
            <Ionicons
              name="chevron-up"
              size={14}
              color={colors.textSecondary}
            />
          </Animated.View>
        </GestureDetector>

        <View
          style={[
            styles.container,
            styles.editingContainer,
            {
              backgroundColor: lighten(color),
              borderLeftColor: color,
            },
          ]}
        >
          {showTime && (
            <AppText variant="caption" color={secondaryTextColor}>
              {formatTime(start)}
            </AppText>
          )}
          <AppText
            variant="bodySemiBold"
            color={textColor}
            style={styles.title}
            numberOfLines={1}
          >
            {title}
          </AppText>
        </View>

        <GestureDetector gesture={bottomGesture}>
          <Animated.View style={styles.handle}>
            <Ionicons
              name="chevron-down"
              size={14}
              color={colors.textSecondary}
            />
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    );
  },
);

const HANDLE_HEIGHT = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 4,
  },
  editingContainer: {
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 14,
  },
  handle: {
    height: HANDLE_HEIGHT,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
    borderRadius: 4,
  },
});
