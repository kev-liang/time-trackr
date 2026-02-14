import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { lighten } from "@/utils/colors";
import { formatTime } from "@/utils/time";

type ActivityTimelineEventProps = {
  title: string;
  start: string;
  color: string;
  height: number;
  textColor: string;
  secondaryTextColor: string;
};

export const ActivityTimelineEvent = memo(function ActivityTimelineEvent({
  title,
  start,
  color,
  height,
  textColor,
  secondaryTextColor,
}: ActivityTimelineEventProps) {
  const showTime = height > 40;

  return (
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
  );
});

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
