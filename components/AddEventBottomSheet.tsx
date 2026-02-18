import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { AddEventAutocompleteInput } from "@/components/AddEventAutocompleteInput";
import { AppText } from "@/components/ux/AppText";
import type { Activity } from "@/stores/useActivityStore";
import { colors, spacing } from "@/theme";

type AddEventBottomSheetProps = {
  editingEvent?: Activity | null;
  defaultStart?: Date;
  defaultEnd?: Date;
  onSave: (data: { title: string; start: Date; end: Date }) => void;
  onCancel: () => void;
};

function formatTimeDisplay(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export const AddEventBottomSheet = forwardRef<
  BottomSheetModal,
  AddEventBottomSheetProps
>(function AddEventBottomSheet(
  { editingEvent, defaultStart, defaultEnd, onSave, onCancel },
  ref,
) {
  const snapPoints = useMemo(() => ["60%"], []);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [pickerField, setPickerField] = useState<"start" | "end" | null>(null);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setStartTime(new Date(editingEvent.start));
      setEndTime(new Date(editingEvent.end));
    } else {
      setTitle("");
      const now = defaultStart ?? new Date();
      const later = defaultEnd ?? new Date(now.getTime() + 60 * 60000);
      setStartTime(now);
      setEndTime(later);
    }
    setPickerField(null);
  }, [editingEvent, defaultStart, defaultEnd]);

  const handleDismiss = useCallback(() => {
    if (ref && "current" in ref) {
      ref.current?.dismiss();
    }
    onCancel();
  }, [ref, onCancel]);

  const handleSave = useCallback(() => {
    onSave({ title, start: startTime, end: endTime });
    if (ref && "current" in ref) {
      ref.current?.dismiss();
    }
  }, [onSave, title, startTime, endTime, ref]);

  const handleStartChange = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") {
        setPickerField(null);
      }
      if (date) {
        setStartTime(date);
        if (date >= endTime) {
          setEndTime(new Date(date.getTime() + 30 * 60000));
        }
      }
    },
    [endTime],
  );

  const handleEndChange = useCallback(
    (_event: DateTimePickerEvent, date?: Date) => {
      if (Platform.OS === "android") {
        setPickerField(null);
      }
      if (date) {
        setEndTime(date);
      }
    },
    [],
  );

  const isEditing = !!editingEvent;

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
      onDismiss={onCancel}
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
            <DateTimePicker
              value={startTime}
              mode="time"
              display="spinner"
              minuteInterval={15}
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
            <DateTimePicker
              value={endTime}
              mode="time"
              display="spinner"
              minuteInterval={15}
              minimumDate={startTime}
              onChange={handleEndChange}
            />
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

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
