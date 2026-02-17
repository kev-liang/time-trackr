import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { AppText } from "@/components/ux/AppText";
import { colors } from "@/theme";
import { lighten } from "@/utils/colors";
import { formatTime } from "@/utils/time";
import { durationMinutes } from "@/utils/activityTime";

type ActivityTimelineEventEditProps = {
  id?: string;
  title: string;
  start: string;
  end: string;
  color: string;
  height: number;
  textColor: string;
  secondaryTextColor: string;
  onDragEnd?: (id: string, deltaStart: number, deltaEnd: number) => void;
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
    onDragEnd,
  }: ActivityTimelineEventEditProps) {
    const showTime = height > 40;

    const topOffset = useSharedValue(0);
    const bottomOffset = useSharedValue(0);

    const pixelsPerMinute = height / durationMinutes(start, end);

    const handleDragEnd = (deltaStartMin: number, deltaEndMin: number) => {
      if (id && onDragEnd) {
        onDragEnd(id, deltaStartMin, deltaEndMin);
      }
    };

    const topGesture = Gesture.Pan()
      .runOnJS(true)
      .onUpdate((e) => {
        topOffset.value = Math.min(e.translationY, 0);
      })
      .onEnd(() => {
        const deltaMinutes =
          Math.round(topOffset.value / pixelsPerMinute / 15) * 15;
        topOffset.value = 0;
        handleDragEnd(deltaMinutes, 0);
      });

    const bottomGesture = Gesture.Pan()
      .runOnJS(true)
      .onUpdate((e) => {
        bottomOffset.value = Math.max(e.translationY, 0);
      })
      .onEnd(() => {
        const deltaMinutes =
          Math.round(bottomOffset.value / pixelsPerMinute / 15) * 15;
        bottomOffset.value = 0;
        handleDragEnd(0, deltaMinutes);
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
