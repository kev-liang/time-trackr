import { colors } from "@/theme";
import React, { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Ellipse, Rect, Svg } from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const cx = 512;
const cy = 512;
const HEIGHT_OFFSET = 44;

const minuteHandWidth = 90;
const minuteHandHeight = 215.508;
const hourHandWidth = 90;
const hourHandHeight = 280.508;

const minuteStartAngle = -45;
const hourStartAngle = 45;

// Milliseconds per full rotation
const MINUTE_HAND_SPEED = 2000;
const HOUR_HAND_SPEED = 4000;

export const ClockLoading: React.FC = () => {
  const minuteRotation = useSharedValue(minuteStartAngle);
  const hourRotation = useSharedValue(hourStartAngle);

  useEffect(() => {
    // Clockwise: +360 per cycle
    minuteRotation.value = withRepeat(
      withTiming(minuteStartAngle + 360, {
        duration: MINUTE_HAND_SPEED,
        easing: Easing.linear,
      }),
      -1, // infinite
      false,
    );

    // Counter-clockwise: -360 per cycle
    hourRotation.value = withRepeat(
      withTiming(hourStartAngle - 360, {
        duration: HOUR_HAND_SPEED,
        easing: Easing.linear,
      }),
      -1, // infinite
      false,
    );
  }, []);

  const minuteAnimatedProps = useAnimatedProps(() => ({
    rotation: minuteRotation.value,
  }));

  const hourAnimatedProps = useAnimatedProps(() => ({
    rotation: hourRotation.value,
  }));

  return (
    <Svg viewBox="0 0 1024 1024" style={{ width: "80%", aspectRatio: 1 }}>
      {/* Clock face */}
      <Ellipse
        cx={cx}
        cy={cy}
        rx={399.04688}
        ry={393.21976}
        fill="none"
        stroke="white"
        strokeWidth={85.0574}
      />

      {/* Minute hand — clockwise */}
      <AnimatedRect
        x={cx - minuteHandWidth / 2}
        y={cy - minuteHandHeight}
        width={minuteHandWidth}
        height={minuteHandHeight + HEIGHT_OFFSET}
        rx={45}
        ry={45}
        fill="white"
        originX={cx}
        originY={cy}
        animatedProps={minuteAnimatedProps}
      />

      {/* Hour hand — counter-clockwise */}
      <AnimatedRect
        x={cx - hourHandWidth / 2}
        y={cy - hourHandHeight}
        width={hourHandWidth}
        height={hourHandHeight + HEIGHT_OFFSET}
        rx={45}
        ry={45.254}
        fill={colors.primary}
        originX={cx}
        originY={cy}
        animatedProps={hourAnimatedProps}
      />
    </Svg>
  );
};
