import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActivityTimeline } from "@/components/ActivityTimeline";
import { AddEventBottomSheet } from "@/components/AddEventBottomSheet";
import { ThemedView } from "@/components/themed-view";
import { Fab } from "@/components/ux/Fab";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore, type Activity } from "@/stores/useActivityStore";
import { applyDragDeltas } from "@/utils/activityTime";

export function ActivityScreen() {
  const activities = useActivityStore((s) => s.activities);
  const loadActivities = useActivityStore((s) => s.loadActivities);
  const addActivity = useActivityStore((s) => s.addActivity);
  const updateActivity = useActivityStore((s) => s.updateActivity);

  const editingEventId = useActivityEditStore((s) => s.editingEventId);
  const setEditingEventId = useActivityEditStore((s) => s.setEditingEventId);
  const clearEditing = useActivityEditStore((s) => s.clearEditing);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [defaultStart, setDefaultStart] = useState<Date | undefined>();
  const [defaultEnd, setDefaultEnd] = useState<Date | undefined>();

  const editingEvent: Activity | null =
    activities.find((a) => a.id === editingEventId) ?? null;

  const handleOpen = useCallback(() => {
    clearEditing();
    setDefaultStart(undefined);
    setDefaultEnd(undefined);
    bottomSheetRef.current?.present();
  }, [clearEditing]);

  const handleEventPress = useCallback(
    (id: string) => {
      setEditingEventId(id);
      setDefaultStart(undefined);
      setDefaultEnd(undefined);
      bottomSheetRef.current?.present();
    },
    [setEditingEventId],
  );

  const handleBackgroundPress = useCallback(
    (timeString: string, date: string) => {
      clearEditing();
      const [hours, minutes] = timeString.split(":").map(Number);
      const start = new Date(date);
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start.getTime() + 60 * 60000);
      setDefaultStart(start);
      setDefaultEnd(end);
      bottomSheetRef.current?.present();
    },
    [clearEditing],
  );

  const handleCancel = useCallback(() => {
    clearEditing();
  }, [clearEditing]);

  const handleSave = useCallback(
    (data: { title: string; start: Date; end: Date }) => {
      if (editingEventId) {
        updateActivity(editingEventId, {
          title: data.title,
          start: data.start.toISOString(),
          end: data.end.toISOString(),
        });
      } else {
        addActivity({
          title: data.title,
          start: data.start.toISOString(),
          end: data.end.toISOString(),
          color: "#4293ff",
        });
      }
      clearEditing();
    },
    [editingEventId, updateActivity, addActivity, clearEditing],
  );

  const handleDragEnd = useCallback(
    (id: string, deltaStartMin: number, deltaEndMin: number) => {
      const event = activities.find((a) => a.id === id);
      if (!event) return;

      const updates = applyDragDeltas(event, deltaStartMin, deltaEndMin);
      if (Object.keys(updates).length > 0) {
        updateActivity(id, updates);
      }
    },
    [activities, updateActivity],
  );

  return (
    <BottomSheetModalProvider>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <ActivityTimeline
            editingEventId={editingEventId}
            onEventPress={handleEventPress}
            onDragEnd={handleDragEnd}
            onBackgroundPress={handleBackgroundPress}
          />
          <Fab onPress={handleOpen} />
        </SafeAreaView>
      </ThemedView>
      <AddEventBottomSheet
        ref={bottomSheetRef}
        editingEvent={editingEvent}
        defaultStart={defaultStart}
        defaultEnd={defaultEnd}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
