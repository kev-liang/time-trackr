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

export function CalendarKitScreen() {
  const loadActivities = useActivityStore((s) => s.loadActivities);
  const clearEditing = useActivityEditStore((s) => s.clearEditing);
  const openSheet = useActivityEditStore((s) => s.openSheet);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleOpen = useCallback(() => {
    clearEditing();
    openSheet();
  }, [clearEditing, openSheet]);

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
