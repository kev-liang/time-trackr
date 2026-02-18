import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { lighten } from "@/utils/colors";
import { formatTime } from "@/utils/time";
import { colors } from "@/theme";

type Props = {
  id: string;
  title: string;
  start: string;
  color: string;
};

export const CalendarKitEvent = memo(
  function CalendarKitEvent({ id, title, start, color }: Props) {
    const handlePress = () => {
      if (!id) return;
      const store = useActivityEditStore.getState();
      store.setEditingEventId(id);
      store.openSheet();
    };

    return (
      <Pressable onPress={handlePress} style={styles.pressable}>
        <View
          style={[
            styles.container,
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
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  pressable: {
    height: "100%",
    width: "100%",
  },
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
