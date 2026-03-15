import { colors } from "@/theme";
import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, View } from "react-native";
import { Ellipse, Svg } from "react-native-svg";

const SIZE = 80;
const MINUTE_HAND_H = 17;
const HOUR_HAND_H = 23;
const HAND_WIDTH = 6;

const minuteStartAngle = -45;
const hourStartAngle = 45;
const MINUTE_HAND_SPEED = 2000;
const HOUR_HAND_SPEED = 4000;

export const ClockLoading: React.FC = () => {
  const minuteRotation = useSharedValue(minuteStartAngle);
  const hourRotation = useSharedValue(hourStartAngle);

  useEffect(() => {
    // Counter-clockwise
    minuteRotation.value = withRepeat(
      withTiming(minuteStartAngle - 360, {
        duration: MINUTE_HAND_SPEED,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    // Clockwise
    hourRotation.value = withRepeat(
      withTiming(hourStartAngle + 360, {
        duration: HOUR_HAND_SPEED,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, []);

  const minuteStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: minuteRotation.value + "deg" }],
  }));

  const hourStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: hourRotation.value + "deg" }],
  }));

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Ellipse
          cx={SIZE / 2}
          cy={SIZE / 2}
          rx={30}
          ry={30}
          fill="none"
          stroke={colors.primary}
          strokeWidth={6}
        />
      </Svg>

      {/* Minute hand — counter-clockwise. Pivot container is SIZE×SIZE centered on clock;
          paddingTop pushes the hand down so its base sits exactly at the clock center,
          making the container center the rotation pivot. */}
      <Animated.View
        style={[
          styles.handPivot,
          { paddingTop: SIZE / 2 - MINUTE_HAND_H + HAND_WIDTH / 2 },
          minuteStyle,
        ]}
      >
        <View style={styles.minuteHand} />
      </Animated.View>

      {/* Hour hand — clockwise */}
      <Animated.View
        style={[
          styles.handPivot,
          { paddingTop: SIZE / 2 - HOUR_HAND_H + HAND_WIDTH / 2 },
          hourStyle,
        ]}
      >
        <View style={styles.hourHand} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  // Full-size absolute overlay; its center = clock center = rotation pivot
  handPivot: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    alignItems: "center",
  },
  minuteHand: {
    width: HAND_WIDTH,
    height: MINUTE_HAND_H,
    borderRadius: HAND_WIDTH / 2,
    backgroundColor: colors.primary,
  },
  hourHand: {
    width: HAND_WIDTH,
    height: HOUR_HAND_H,
    borderRadius: HAND_WIDTH / 2,
    backgroundColor: colors.primary,
  },
});
