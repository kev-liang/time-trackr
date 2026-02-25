import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import { AddEventAutocompleteInput } from "@/components/activities/AddEventAutocompleteInput";
import { AppText } from "@/components/ux/AppText";
import { TimeSpinnerPicker } from "@/components/ux/TimeSpinnerPicker";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { colors, spacing } from "@/theme";
import { MS_PER_MINUTE } from "@/utils/activityTime";

function formatTimeDisplay(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

interface AddEventBottomSheetProps {
  animatedPosition: SharedValue<number>;
  onPositionsCalculated?: (minPosition: number, maxPosition: number) => void;
}

export function AddEventBottomSheet({
  animatedPosition,
  onPositionsCalculated,
}: AddEventBottomSheetProps) {
  const snapPoints = useMemo(() => ["60%"], []);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const hasCalculatedPositions = useRef(false);

  const editingEventId = useActivityEditStore((s) => s.editingEventId);
  const defaultStart = useActivityEditStore((s) => s.defaultStart);
  const defaultEnd = useActivityEditStore((s) => s.defaultEnd);
  const sheetOpen = useActivityEditStore((s) => s.sheetOpen);
  const clearEditing = useActivityEditStore((s) => s.clearEditing);
  const setHasDraft = useActivityEditStore((s) => s.setHasDraft);

  const activities = useActivityStore((s) => s.activities);
  const addActivity = useActivityStore((s) => s.addActivity);
  const updateActivity = useActivityStore((s) => s.updateActivity);

  const editingEvent = editingEventId
    ? (activities.find((a) => a.id === editingEventId) ?? null)
    : null;

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [pickerField, setPickerField] = useState<"start" | "end" | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (sheetOpen) {
      bottomSheetRef.current?.present();
    }
  }, [sheetOpen]);

  // Reset title and picker when switching between events or re-opening create mode.
  // sheetOpen in deps ensures the title clears when the sheet is re-opened for creation.
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
    } else {
      setTitle("");
    }
    setPickerField(null);
  }, [editingEvent, sheetOpen]);

  // Sync times separately so drag-to-resize updates don't wipe the user's typed title.
  useEffect(() => {
    if (editingEvent) {
      setStartTime(new Date(editingEvent.start));
      setEndTime(new Date(editingEvent.end));
    } else {
      const now = defaultStart ?? new Date();
      const later = defaultEnd ?? new Date(now.getTime() + 60 * MS_PER_MINUTE);
      setStartTime(now);
      setEndTime(later);
    }
    setResetKey((k) => k + 1);
  }, [editingEvent, defaultStart, defaultEnd]);

  const handleDismiss = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    clearEditing();
    setHasDraft(false);
  }, [clearEditing]);

  const handleSave = useCallback(() => {
    if (editingEventId) {
      updateActivity(editingEventId, {
        title,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      });
    } else {
      addActivity({
        title,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        color: "#4293ff",
      });
    }
    bottomSheetRef.current?.dismiss();
    clearEditing();
  }, [
    editingEventId,
    title,
    startTime,
    endTime,
    updateActivity,
    addActivity,
    clearEditing,
  ]);

  const handleStartChange = useCallback(
    (date: Date) => {
      setStartTime(date);
      if (date >= endTime) {
        setEndTime(new Date(date.getTime() + 30 * MS_PER_MINUTE));
      }
    },
    [endTime],
  );

  const handleEndChange = useCallback((date: Date) => {
    setEndTime(date);
  }, []);

  const handleAnimate = useCallback(
    (
      _fromIndex: number,
      _toIndex: number,
      fromPosition: number,
      toPosition: number,
    ) => {
      if (onPositionsCalculated && !hasCalculatedPositions.current) {
        onPositionsCalculated(
          Math.min(fromPosition, toPosition),
          Math.max(fromPosition, toPosition),
        );
        hasCalculatedPositions.current = true;
      }
    },
    [onPositionsCalculated],
  );

  const isEditing = !!editingEvent;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
      onDismiss={clearEditing}
      animatedPosition={animatedPosition}
      onAnimate={handleAnimate}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={handleDismiss}>
            <AppText variant="body" color={colors.tint}>
              Cancel
            </AppText>
          </Pressable>
          <AppText variant="bodySemiBold">
            {isEditing ? "Edit Event" : "Add Event"}
          </AppText>
          <Pressable onPress={handleSave}>
            <AppText variant="bodySemiBold" color={colors.tint}>
              Save
            </AppText>
          </Pressable>
        </View>
        <View style={styles.form}>
          <AddEventAutocompleteInput
            value={title}
            onChangeText={setTitle}
            onSelect={(item) => setTitle(item.label)}
          />

          <View style={styles.timeRow}>
            <AppText variant="body" color={colors.textSecondary}>
              Start
            </AppText>
            <Pressable
              style={styles.timeButton}
              onPress={() =>
                setPickerField(pickerField === "start" ? null : "start")
              }
            >
              <AppText variant="bodySemiBold">
                {formatTimeDisplay(startTime)}
              </AppText>
            </Pressable>
          </View>

          {pickerField === "start" && (
            <TimeSpinnerPicker
              key={`start-${resetKey}`}
              value={startTime}
              minuteInterval={5}
              onChange={handleStartChange}
            />
          )}

          <View style={styles.timeRow}>
            <AppText variant="body" color={colors.textSecondary}>
              End
            </AppText>
            <Pressable
              style={styles.timeButton}
              onPress={() =>
                setPickerField(pickerField === "end" ? null : "end")
              }
            >
              <AppText variant="bodySemiBold">
                {formatTimeDisplay(endTime)}
              </AppText>
            </Pressable>
          </View>

          {pickerField === "end" && (
            <TimeSpinnerPicker
              key={`end-${resetKey}`}
              value={endTime}
              minuteInterval={5}
              onChange={handleEndChange}
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background,
  },
  indicator: {
    backgroundColor: colors.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  form: {
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
});
