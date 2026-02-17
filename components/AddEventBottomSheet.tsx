import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

import { AddEventAutocompleteInput } from "@/components/AddEventAutocompleteInput";
import { AppText } from "@/components/ux/AppText";
import type { Activity } from "@/stores/useActivityStore";
import { colors, spacing } from "@/theme";

type AddEventBottomSheetProps = {
  editingEvent?: Activity | null;
  onSave: (title: string) => void;
  onCancel: () => void;
};

export const AddEventBottomSheet = forwardRef<
  BottomSheetModal,
  AddEventBottomSheetProps
>(function AddEventBottomSheet({ editingEvent, onSave, onCancel }, ref) {
  const snapPoints = useMemo(() => ["60%"], []);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
    } else {
      setTitle("");
    }
  }, [editingEvent]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  const handleDismiss = useCallback(() => {
    if (ref && "current" in ref) {
      ref.current?.dismiss();
    }
    onCancel();
  }, [ref, onCancel]);

  const handleSave = useCallback(() => {
    onSave(title);
    if (ref && "current" in ref) {
      ref.current?.dismiss();
    }
  }, [onSave, title, ref]);

  const isEditing = !!editingEvent;

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
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
  },
});
