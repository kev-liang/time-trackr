import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

import { colors } from "@/theme";

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 20;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - 6;

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function Toggle({ value, onValueChange, disabled = false }: ToggleProps) {
  const translateX = useRef(new Animated.Value(value ? THUMB_TRAVEL : 0)).current;
  const trackColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: value ? THUMB_TRAVEL : 0,
        useNativeDriver: true,
        overshootClamping: true,
      }),
      Animated.timing(trackColor, {
        toValue: value ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value]);

  const interpolatedTrack = trackColor.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.tint],
  });

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      hitSlop={4}
    >
      <Animated.View
        style={[
          styles.track,
          { backgroundColor: interpolatedTrack, opacity: disabled ? 0.4 : 1 },
        ]}
      >
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: 3,
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
