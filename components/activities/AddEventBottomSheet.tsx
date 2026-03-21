import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import moment from "moment";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddEventAutocompleteInput } from "@/components/activities/AddEventAutocompleteInput";
import { AppText } from "@/components/ux/AppText";
import { ConfirmationModal } from "@/components/ux/ConfirmationModal";
import { TimeSpinnerPicker } from "@/components/ux/TimeSpinnerPicker";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { colors, spacing } from "@/theme";
import { MS_PER_MINUTE } from "@/utils/activityTime";

function formatTimeDisplay(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${period}`;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface AddEventBottomSheetProps {
  animatedPosition: SharedValue<number>;
  onPositionsCalculated?: (minPosition: number, maxPosition: number) => void;
}

export function AddEventBottomSheet({
  animatedPosition,
  onPositionsCalculated,
}: AddEventBottomSheetProps) {
  const { top: topInset } = useSafeAreaInsets();
  const snapPoints = useMemo(() => [300], []);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const hasCalculatedPositions = useRef(false);

  const editingEventId = useActivityEditStore((s) => s.editingEventId);
  const draftStart = useActivityEditStore((s) => s.draftStart);
  const draftEnd = useActivityEditStore((s) => s.draftEnd);
  const sheetOpen = useActivityEditStore((s) => s.sheetOpen);
  const clearEditing = useActivityEditStore((s) => s.clearEditing);
  const setHasDraft = useActivityEditStore((s) => s.setHasDraft);
  const setPreview = useActivityEditStore((s) => s.setPreview);
  const setDraftColor = useActivityEditStore((s) => s.setDraftColor);
  const setDraftTitle = useActivityEditStore((s) => s.setDraftTitle);

  const activities = useActivityStore((s) => s.activities);
  const addActivity = useActivityStore((s) => s.addActivity);
  const updateActivity = useActivityStore((s) => s.updateActivity);
  const removeActivity = useActivityStore((s) => s.removeActivity);

  const editingEvent = editingEventId
    ? (activities.find((a) => a.id === editingEventId) ?? null)
    : null;

  const [localTitle, setLocalTitle] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>(colors.tint);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [pickerField, setPickerField] = useState<"start" | "end" | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (sheetOpen) {
      bottomSheetRef.current?.present();
    }
  }, [sheetOpen]);

  // Reset title and picker when switching between events or re-opening create mode.
  // sheetOpen in deps ensures the title clears when the sheet is re-opened for creation.
  useEffect(() => {
    if (editingEvent) {
      setLocalTitle("");
      setSelectedTitle(editingEvent.title);
      setSelectedColor(editingEvent.color);
    } else {
      setLocalTitle("");
      setSelectedTitle("");
      setSelectedColor(colors.tint);
    }
    setTitleError(null);
    setTimeError(null);
    setPickerField(null);
  }, [editingEvent, sheetOpen]);

  // Sync times separately so drag-to-resize updates don't wipe the user's typed title.
  useEffect(() => {
    if (editingEvent) {
      setStartTime(new Date(editingEvent.start));
      setEndTime(new Date(editingEvent.end));
    } else {
      const now = draftStart ?? new Date();
      const later = draftEnd ?? new Date(now.getTime() + 60 * MS_PER_MINUTE);
      setStartTime(now);
      setEndTime(later);
    }
    setResetKey((k) => k + 1);
  }, [editingEvent, draftStart, draftEnd]);

  useEffect(() => {
    if (pickerField !== null) {
      bottomSheetRef.current?.snapToIndex(1);
    } else {
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [pickerField]);

  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidHide", () => {
      bottomSheetRef.current?.snapToIndex(0);
    });
    return () => sub.remove();
  }, []);

  const handleDismissKeyboard = useCallback(() => {
    TextInput.State.blurTextInput(TextInput.State.currentlyFocusedInput());
  }, []);

  const handleDismiss = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    clearEditing();
    setHasDraft(false);
  }, [clearEditing]);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!editingEventId) return;
    setShowDeleteConfirm(false);
    removeActivity(editingEventId);
    bottomSheetRef.current?.dismiss();
    clearEditing();
  }, [editingEventId, removeActivity, clearEditing]);

  const handleSave = useCallback(() => {
    if (!selectedTitle) {
      setTitleError("Title is required");
      return;
    }
    setTitleError(null);
    if (timeError) return;
    if (editingEventId) {
      updateActivity(editingEventId, {
        title: selectedTitle,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        color: selectedColor,
      });
    } else {
      addActivity({
        title: selectedTitle,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        color: selectedColor,
      });
    }
    bottomSheetRef.current?.dismiss();
    clearEditing();
  }, [
    editingEventId,
    selectedTitle,
    selectedColor,
    startTime,
    endTime,
    updateActivity,
    addActivity,
    clearEditing,
  ]);

  const handleStartChange = useCallback(
    (date: Date) => {
      setStartTime(date);
      if (moment(date).isSameOrAfter(endTime)) {
        setTimeError("Start time must be before end time");
      } else {
        setTimeError(null);
      }
      setPreview(date, endTime);
    },
    [endTime, setPreview],
  );

  const handleEndChange = useCallback(
    (date: Date) => {
      setEndTime(date);
      if (moment(date).isSameOrBefore(startTime)) {
        setTimeError("Start time must be before end time");
      } else {
        setTimeError(null);
      }
      setPreview(startTime, date);
    },
    [startTime, setPreview],
  );

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

  const initialItem = useMemo(
    () =>
      editingEvent
        ? {
            id: editingEventId!,
            label: editingEvent.title,
            color: editingEvent.color,
          }
        : undefined,
    [editingEventId, editingEvent?.color, editingEvent?.title],
  );

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        topInset={topInset}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.background}
        onDismiss={clearEditing}
        animatedPosition={animatedPosition}
        onAnimate={handleAnimate}
        keyboardBehavior="fillParent"
        keyboardBlurBehavior="none"
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
            <View style={styles.headerActions}>
              {isEditing && (
                <Pressable onPress={handleDelete} hitSlop={8}>
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </Pressable>
              )}
              <Pressable onPress={handleSave} hitSlop={8}>
                <Ionicons name="save-outline" size={24} color={colors.tint} />
              </Pressable>
            </View>
          </View>
          <Pressable style={styles.form} onPress={handleDismissKeyboard}>
            <AddEventAutocompleteInput
              value={localTitle}
              onChangeText={setLocalTitle}
              initialItem={initialItem}
              onSelect={(item) => {
                setSelectedTitle(item.label);
                setSelectedColor(item.color ?? colors.tint);
                setDraftColor(item.color ?? colors.tint);
                setDraftTitle(item.label);
                setTitleError(null);
              }}
            />
            {titleError && (
              <AppText variant="body" color="#EF4444">
                {titleError}
              </AppText>
            )}

            <View style={styles.timeRow}>
              <AppText variant="body" color={colors.textSecondary}>
                Start
              </AppText>
              <View style={styles.timeButtonGroup}>
                <AppText variant="bodySemiBold" color={colors.textSecondary}>
                  {formatDateDisplay(startTime)}
                </AppText>
                <Pressable
                  style={styles.timeButton}
                  onPress={() =>
                    setPickerField(pickerField === "start" ? null : "start")
                  }
                >
                  <AppText
                    variant="bodySemiBold"
                    color={timeError ? "#EF4444" : undefined}
                  >
                    {formatTimeDisplay(startTime)}
                  </AppText>
                </Pressable>
              </View>
            </View>
          </Pressable>
          {pickerField === "start" && (
            <View style={styles.inlinePicker}>
              <TimeSpinnerPicker
                key={`start-${resetKey}`}
                value={startTime}
                minuteInterval={5}
                onChange={handleStartChange}
              />
            </View>
          )}
          <Pressable
            style={styles.formContinued}
            onPress={handleDismissKeyboard}
          >
            <View style={styles.timeRow}>
              <AppText variant="body" color={colors.textSecondary}>
                End
              </AppText>
              <View style={styles.timeButtonGroup}>
                <AppText variant="bodySemiBold" color={colors.textSecondary}>
                  {formatDateDisplay(endTime)}
                </AppText>
                <Pressable
                  style={styles.timeButton}
                  onPress={() =>
                    setPickerField(pickerField === "end" ? null : "end")
                  }
                >
                  <AppText
                    variant="bodySemiBold"
                    color={timeError ? "#EF4444" : undefined}
                  >
                    {formatTimeDisplay(endTime)}
                  </AppText>
                </Pressable>
              </View>
            </View>
          </Pressable>
          {pickerField === "end" && (
            <View style={styles.inlinePicker}>
              <TimeSpinnerPicker
                key={`end-${resetKey}`}
                value={endTime}
                minuteInterval={5}
                onChange={handleEndChange}
              />
            </View>
          )}
          {timeError && (
            <AppText
              variant="body"
              color="#EF4444"
              style={{ paddingHorizontal: spacing.xl }}
            >
              {timeError}
            </AppText>
          )}
        </BottomSheetView>
      </BottomSheetModal>

      <ConfirmationModal
        visible={showDeleteConfirm}
        title="Delete Event"
        body="Are you sure you want to delete this event?"
        onDelete={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  timeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  timeButtonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  inlinePicker: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  inlinePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formContinued: {},
});
