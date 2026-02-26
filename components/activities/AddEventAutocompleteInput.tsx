import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useCallback, useMemo } from "react";

import {
  AutocompleteTextInput,
  type AutocompleteItem,
} from "@/components/ux/AutocompleteTextInput";
import { useActivityHistoryStore } from "@/stores/useActivityHistoryStore";

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
    () => rawItems.map((i) => ({ id: i.id, label: i.name, color: i.color })),
    [rawItems],
  );

  const handleCreate = useCallback(
    (label: string, color: string) => {
      const exists = rawItems.some(
        (i) => i.name.toLowerCase() === label.toLowerCase(),
      );
      if (!exists) {
        addItem({ name: label, pinned: false, color });
      }
    },
    [rawItems, addItem],
  );

  return (
    <AutocompleteTextInput
      items={historyItems}
      value={value}
      onChangeText={onChangeText}
      onSelect={onSelect}
      onCreate={handleCreate}
      placeholder="Add Title"
      TextInputComponent={BottomSheetTextInput}
    />
  );
}
