import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef } from "react";
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
  const updateActivity = useActivityStore((s) => s.updateActivity);

  const editingEventId = useActivityEditStore((s) => s.editingEventId);
  const setEditingEventId = useActivityEditStore((s) => s.setEditingEventId);
  const clearEditing = useActivityEditStore((s) => s.clearEditing);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const editingEvent: Activity | null =
    activities.find((a) => a.id === editingEventId) ?? null;

  const handleOpen = useCallback(() => {
    clearEditing();
    bottomSheetRef.current?.present();
  }, [clearEditing]);

  const handleEventPress = useCallback(
    (id: string) => {
      setEditingEventId(id);
      bottomSheetRef.current?.present();
    },
    [setEditingEventId],
  );

  const handleCancel = useCallback(() => {
    clearEditing();
  }, [clearEditing]);

  const handleSave = useCallback(
    (title: string) => {
      if (editingEventId) {
        updateActivity(editingEventId, { title });
      }
      clearEditing();
    },
    [editingEventId, updateActivity, clearEditing],
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
          />
          <Fab onPress={handleOpen} />
        </SafeAreaView>
      </ThemedView>
      <AddEventBottomSheet
        ref={bottomSheetRef}
        editingEvent={editingEvent}
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
