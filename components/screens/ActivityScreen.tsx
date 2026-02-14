import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { CalendarUtils } from "react-native-calendars";

import { ActivityTimeline } from "@/components/ActivityTimeline";
import { AddEventBottomSheet } from "@/components/AddEventBottomSheet";
import { ThemedView } from "@/components/themed-view";
import { Fab } from "@/components/ux/Fab";
import { useActivityStore } from "@/stores/useActivityStore";
import { SafeAreaView } from "react-native-safe-area-context";

function todayISO() {
  return CalendarUtils.getCalendarDateString(new Date());
}

export function ActivityScreen() {
  const addActivity = useActivityStore((s) => s.addActivity);
  const activities = useActivityStore((s) => s.activities);

  // Seed sample data once for demo purposes — remove later
  useEffect(() => {
    if (activities.length > 0) return;
    const today = todayISO();
    addActivity({
      id: "1",
      title: "Deep Work",
      start: `${today} 09:00`,
      end: `${today} 11:30`,
      color: "#4A90D9",
    });
    addActivity({
      id: "2",
      title: "Lunch Break",
      start: `${today} 12:00`,
      end: `${today} 13:00`,
      color: "#66BB6A",
    });
    addActivity({
      id: "3",
      title: "Meetings",
      start: `${today} 14:00`,
      end: `${today} 15:30`,
      color: "#FFA726",
    });
  }, []);

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
