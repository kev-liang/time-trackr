import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { lighten } from "@/utils/colors";
import { formatTime } from "@/utils/time";

type ActivityTimelineEventReadonlyProps = {
  id?: string;
  title: string;
  start: string;
  color: string;
  height: number;
  textColor: string;
  secondaryTextColor: string;
  onPress?: (id: string) => void;
};

export const ActivityTimelineEventReadonly = memo(
  function ActivityTimelineEventReadonly({
    id,
    title,
    start,
    color,
    height,
    textColor,
    secondaryTextColor,
    onPress,
  }: ActivityTimelineEventReadonlyProps) {
    const showTime = height > 40;

    const handlePress = () => {
      if (id && onPress) {
        onPress(id);
      }
    };

    return (
      <Pressable
        onPress={handlePress}
        style={{ height: "100%", width: "100%" }}
      >
        <View
          style={[
            styles.container,
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
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 4,
  },
  title: {
    fontSize: 14,
  },
});
