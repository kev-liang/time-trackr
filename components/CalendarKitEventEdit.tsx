import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { colors } from "@/theme";
import { lighten } from "@/utils/colors";
import { formatTime } from "@/utils/time";

type Props = {
  id: string;
  title: string;
  start: string;
  color: string;
};

export const CalendarKitEventEdit = memo(function CalendarKitEventEdit({
  title,
  start,
  color,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        styles.editingContainer,
        { backgroundColor: lighten(color), borderLeftColor: color },
      ]}
    >
      <AppText variant="caption" color={colors.textSecondary}>
        {formatTime(start)}
      </AppText>
      <AppText
        variant="bodySemiBold"
        color={colors.text}
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
});
