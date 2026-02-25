import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";

import {
  AutocompleteTextInput,
  type AutocompleteItem,
} from "@/components/ux/AutocompleteTextInput";
import { useActivityHistoryStore } from "@/stores/useActivityHistoryStore";
import { colors, spacing } from "@/theme";

type AddEventAutocompleteInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (item: AutocompleteItem) => void;
};

export function AddEventAutocompleteInput({
  value,
  onChangeText,
  onSelect,
}: AddEventAutocompleteInputProps) {
  const rawItems = useActivityHistoryStore((s) => s.items);
  const addItem = useActivityHistoryStore((s) => s.addItem);
  const historyItems = useMemo(
    () => rawItems.map((i) => ({ id: i.id, label: i.name })),
    [rawItems],
  );

  const handleAdd = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const exists = historyItems.some(
      (i) => i.label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) return;
    addItem({
      name: trimmed,
      pinned: false,
    });
  }, [value, historyItems, addItem]);

  return (
    <AutocompleteTextInput
      items={historyItems}
      value={value}
      onChangeText={onChangeText}
      onSelect={onSelect}
      placeholder="Add Title"
      TextInputComponent={BottomSheetTextInput}
    />
  );
}

const styles = StyleSheet.create({
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: spacing.sm + 4,
    alignSelf: "stretch",
  },
});
