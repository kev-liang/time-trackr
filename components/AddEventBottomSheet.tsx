import { forwardRef, useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

import { AppText } from "@/components/ux/AppText";
import { AutocompleteTextInput } from "@/components/ux/AutocompleteTextInput";
import { useActivityHistoryStore } from "@/stores/useActivityHistoryStore";
import { useShallow } from "zustand/react/shallow";
import { colors, spacing } from "@/theme";

type AddEventBottomSheetProps = {
  onSave: () => void;
};

export const AddEventBottomSheet = forwardRef<
  BottomSheetModal,
  AddEventBottomSheetProps
>(function AddEventBottomSheet({ onSave }, ref) {
  const snapPoints = useMemo(() => ["60%"], []);
  const [title, setTitle] = useState("");
  const historyItems = useActivityHistoryStore(
    useShallow((s) => s.items.map((i) => ({ id: i.id, label: i.name }))),
  );

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
  }, [ref]);

  const handleSave = useCallback(() => {
    onSave();
    handleDismiss();
  }, [onSave, handleDismiss]);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={handleDismiss}>
            <AppText variant="body" color={colors.tint}>
              Cancel
            </AppText>
          </Pressable>
          <AppText variant="bodySemiBold">Add Event</AppText>
          <Pressable onPress={handleSave}>
            <AppText variant="bodySemiBold" color={colors.tint}>
              Save
            </AppText>
          </Pressable>
        </View>
        <View style={styles.form}>
          <AutocompleteTextInput
            items={historyItems}
            value={title}
            onChangeText={setTitle}
            onSelect={(item) => setTitle(item.label)}
            placeholder="Add Title"
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
