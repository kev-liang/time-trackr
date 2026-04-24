import { useCallback, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AlarmFrequencyInput } from "@/components/alarms/AlarmFrequencyInput";
import { AlarmScheduleCard } from "@/components/alarms/AlarmScheduleCard";
import { AlarmSettingsSection } from "@/components/alarms/AlarmSettingsSection";
import { ThemedView } from "@/components/themed-view";
import { AppText } from "@/components/ux/AppText";
import { Card } from "@/components/ux/Card";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { colors, spacing } from "@/theme";

const PICKER_HEIGHT = 240;
const SCROLL_PADDING = 16;

export function AlarmsScreen() {
  const enabled = useAlarmStore((s) => s.enabled);
  const session = useAuthStore((s) => s.session);
  const supportId = session ? session.user.id.split("-").slice(0, 2).join("-") : "—";
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollViewContainerRef = useRef<View>(null);
  const scrollOffsetRef = useRef(0);

  const handlePickerOpen = useCallback((rowY: number, rowHeight: number) => {
    scrollViewContainerRef.current?.measureInWindow((_x, sy, _w, sh) => {
      const pickerBottom = rowY + rowHeight + PICKER_HEIGHT + SCROLL_PADDING;
      const scrollViewBottom = sy + sh;
      if (pickerBottom > scrollViewBottom) {
        scrollViewRef.current?.scrollTo({
          y: scrollOffsetRef.current + (pickerBottom - scrollViewBottom),
          animated: true,
        });
      }
    });
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View ref={scrollViewContainerRef} style={styles.container}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.content}
            onScroll={(e) => {
              scrollOffsetRef.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
          >
            <AppText variant="title">Settings</AppText>

            <Card title="Reminders">
              <AlarmSettingsSection />
            </Card>

            <Card title="Frequency">
              {!enabled && (
                <AppText
                  variant="body"
                  color={colors.textSecondary}
                  style={{ marginBottom: spacing.sm }}
                >
                  Enable reminders to edit frequency
                </AppText>
              )}
              <AlarmFrequencyInput />
            </Card>

            <AlarmScheduleCard onPickerOpen={handlePickerOpen} />

            <AppText variant="body" color={colors.textSecondary}>
              Customer Support ID: {supportId}
            </AppText>
          </ScrollView>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
