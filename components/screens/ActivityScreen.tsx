import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityTimeline } from "@/components/ActivityTimeline";
import { AddEventBottomSheet } from "@/components/AddEventBottomSheet";
import { ThemedView } from "@/components/themed-view";
import { Fab } from "@/components/ux/Fab";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { MS_PER_MINUTE } from "@/utils/activityTime";

export function ActivityScreen() {
  const loadActivities = useActivityStore((s) => s.loadActivities);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleOpen = useCallback(() => {
    const now = new Date();
    const end = new Date(now.getTime() + 60 * MS_PER_MINUTE);
    useActivityEditStore.getState().openCreate(now, end);
  }, []);

  return (
    <BottomSheetModalProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <ActivityTimeline />
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
