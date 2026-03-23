import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import moment from "moment";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddEventAutocompleteInput } from "@/components/activities/AddEventAutocompleteInput";
import { EventSheetHeader } from "@/components/activities/EventSheetHeader";
import { TimePickerRow } from "@/components/activities/TimePickerRow";
import { AppText } from "@/components/ux/AppText";
import { ConfirmationModal } from "@/components/ux/ConfirmationModal";
import { FreemiumBanner } from "@/components/ux/FreemiumBanner";
import { useBottomSheetSnapPoints } from "@/hooks/useBottomSheetSnapPoints";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { colors, spacing } from "@/theme";
import { MS_PER_MINUTE } from "@/utils/activityTime";

interface AddEventBottomSheetProps {
  animatedPosition: SharedValue<number>;
  onPositionsCalculated?: (minPosition: number, maxPosition: number) => void;
}

export function AddEventBottomSheet({
  animatedPosition,
  onPositionsCalculated,
}: AddEventBottomSheetProps) {
  const { top: topInset } = useSafeAreaInsets();
  const [pickerField, setPickerField] = useState<"start" | "end" | null>(null);
  const pickerFieldRef = useRef<"start" | "end" | null>(null);
  const snapPoints = useBottomSheetSnapPoints(pickerField);
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

  type SheetFormValues = {
    title: string;
    color: string;
    startTime: Date;
    endTime: Date;
  };

  const {
    setValue,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<SheetFormValues>({
    defaultValues: {
      title: "",
      color: colors.tint,
      startTime: new Date(),
      endTime: new Date(),
    },
  });

  const selectedTitle = watch("title");
  const selectedColor = watch("color");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  const [localTitle, setLocalTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const isProgrammaticDismiss = useRef(false);
  const dismissedByPan = useRef(false);

  useEffect(() => {
    if (sheetOpen) {
      bottomSheetRef.current?.present();
    }
  }, [sheetOpen]);

  // Reset title and picker when switching between events or re-opening create mode.
  // sheetOpen in deps ensures the title clears when the sheet is re-opened for creation.
  useEffect(() => {
    const now = draftStart ?? new Date();
    const later = draftEnd ?? new Date(now.getTime() + 60 * MS_PER_MINUTE);
    if (editingEvent) {
      setLocalTitle("");
      reset({
        title: editingEvent.title,
        color: editingEvent.color,
        startTime: new Date(editingEvent.start),
        endTime: new Date(editingEvent.end),
      });
    } else {
      setLocalTitle("");
      reset({ title: "", color: colors.tint, startTime: now, endTime: later });
    }
    setTitleError(null);
    setTimeError(null);
    setPickerField(null);
  }, [editingEvent, sheetOpen]);

  // Sync times separately so drag-to-resize updates don't wipe the user's typed title.
  // keepDirtyValues preserves user-typed fields while resetting the time baseline.
  useEffect(() => {
    if (editingEvent) {
      reset(
        {
          title: editingEvent.title,
          color: editingEvent.color,
          startTime: new Date(editingEvent.start),
          endTime: new Date(editingEvent.end),
        },
        { keepDirtyValues: true },
      );
    } else {
      const now = draftStart ?? new Date();
      const later = draftEnd ?? new Date(now.getTime() + 60 * MS_PER_MINUTE);
      reset(
        { title: "", color: colors.tint, startTime: now, endTime: later },
        { keepDirtyValues: true },
      );
    }
    setResetKey((k) => k + 1);
  }, [editingEvent, draftStart, draftEnd]);

  useEffect(() => {
    pickerFieldRef.current = pickerField;
    bottomSheetRef.current?.snapToIndex(0);
  }, [pickerField]);

  useEffect(() => {
    const sub = Keyboard.addListener("keyboardDidHide", () => {
      if (pickerFieldRef.current === null) {
        bottomSheetRef.current?.snapToIndex(0);
      }
    });
    return () => sub.remove();
  }, []);

  const handleDismissKeyboard = useCallback(() => {
    TextInput.State.blurTextInput(TextInput.State.currentlyFocusedInput());
  }, []);

  const handleDismiss = useCallback(() => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      isProgrammaticDismiss.current = true;
      bottomSheetRef.current?.dismiss();
    }
  }, [isDirty]);

  const handleOnDismiss = useCallback(() => {
    if (!isProgrammaticDismiss.current) {
      if (isDirty) {
        dismissedByPan.current = true;
        setShowDiscardConfirm(true);
      } else {
        clearEditing();
      }
    } else {
      clearEditing();
    }
    isProgrammaticDismiss.current = false;
  }, [clearEditing, isDirty]);

  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
    const wasPan = dismissedByPan.current;
    dismissedByPan.current = false;
    if (!wasPan) {
      isProgrammaticDismiss.current = true;
      bottomSheetRef.current?.dismiss();
    }
    clearEditing();
    setHasDraft(false);
  }, [clearEditing, setHasDraft]);

  const handleCancelDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
    if (dismissedByPan.current) {
      dismissedByPan.current = false;
      bottomSheetRef.current?.present();
    }
  }, []);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!editingEventId) return;
    setShowDeleteConfirm(false);
    removeActivity(editingEventId);
    isProgrammaticDismiss.current = true;
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
    isProgrammaticDismiss.current = true;
    bottomSheetRef.current?.dismiss();
    clearEditing();
  }, [
    editingEventId,
    selectedTitle,
    selectedColor,
    startTime,
    endTime,
    timeError,
    updateActivity,
    addActivity,
    clearEditing,
  ]);

  const handleStartChange = useCallback(
    (date: Date) => {
      setValue("startTime", date, { shouldDirty: true });
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
      setValue("endTime", date, { shouldDirty: true });
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
        onDismiss={handleOnDismiss}
        animatedPosition={animatedPosition}
        onAnimate={handleAnimate}
        keyboardBehavior="fillParent"
        keyboardBlurBehavior="none"
      >
        <BottomSheetView style={styles.content}>
          <EventSheetHeader
            isEditing={isEditing}
            onCancel={handleDismiss}
            onDelete={handleDelete}
            onSave={handleSave}
          />
          <Pressable style={styles.form} onPress={handleDismissKeyboard}>
            <AddEventAutocompleteInput
              value={localTitle}
              onChangeText={setLocalTitle}
              initialItem={initialItem}
              onSelect={(item) => {
                setValue("title", item.label, { shouldDirty: true });
                setValue("color", item.color ?? colors.tint, {
                  shouldDirty: true,
                });
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
          </Pressable>
          <View style={styles.freemiumBanner}>
            <FreemiumBanner />
          </View>
          <TimePickerRow
            label="Start"
            time={startTime}
            isOpen={pickerField === "start"}
            hasError={!!timeError}
            resetKey={resetKey}
            onToggle={() =>
              setPickerField(pickerField === "start" ? null : "start")
            }
            onChange={handleStartChange}
          />
          <TimePickerRow
            label="End"
            time={endTime}
            isOpen={pickerField === "end"}
            hasError={!!timeError}
            resetKey={resetKey}
            onToggle={() =>
              setPickerField(pickerField === "end" ? null : "end")
            }
            onChange={handleEndChange}
          />
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
        body={
          <>
            <AppText variant="body" color="textSecondary">
              Are you sure you want to delete this event?
            </AppText>
          </>
        }
        onDelete={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmationModal
        visible={showDiscardConfirm}
        title="Discard Changes?"
        body={
          <AppText variant="body" color="textSecondary">
            Your changes will be lost.
          </AppText>
        }
        deleteLabel="Discard"
        cancelLabel="Keep Editing"
        onDelete={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
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
  form: {
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  freemiumBanner: {
    marginVertical: spacing.md,
  },
});
