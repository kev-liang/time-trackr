import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarKitTimeline } from "@/components/CalendarKitTimeline";
import { AddEventBottomSheet } from "@/components/AddEventBottomSheet";
import { ThemedView } from "@/components/themed-view";
import { Fab } from "@/components/ux/Fab";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { MS_PER_MINUTE } from "@/utils/activityTime";

export function CalendarKitScreen() {
  const loadActivities = useActivityStore((s) => s.loadActivities);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleOpen = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getTime() - 30 * MS_PER_MINUTE);
    useActivityEditStore.getState().openCreate(start, now);
  }, []);

  return (
    <BottomSheetModalProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <CalendarKitTimeline />
          <Fab onPress={handleOpen} />
        </SafeAreaView>
      </ThemedView>
      <AddEventBottomSheet />
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
