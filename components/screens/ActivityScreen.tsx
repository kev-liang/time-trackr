import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";

import { ActivityTimeline } from "@/components/ActivityTimeline";
import { AddEventBottomSheet } from "@/components/AddEventBottomSheet";
import { ThemedView } from "@/components/themed-view";
import { Fab } from "@/components/ux/Fab";
import { useActivityStore } from "@/stores/useActivityStore";
import { SafeAreaView } from "react-native-safe-area-context";

export function ActivityScreen() {
  const loadActivities = useActivityStore((s) => s.loadActivities);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handleOpen = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleSave = useCallback(() => {
    // TODO: wire up form data
  }, []);

  return (
    <BottomSheetModalProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <ActivityTimeline />
          <Fab onPress={handleOpen} />
        </SafeAreaView>
      </ThemedView>
      <AddEventBottomSheet ref={bottomSheetRef} onSave={handleSave} />
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
