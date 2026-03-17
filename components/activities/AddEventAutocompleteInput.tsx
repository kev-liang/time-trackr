import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useState } from "react";

import {
  AutocompleteTextInput,
  type AutocompleteItem,
} from "@/components/ux/AutocompleteTextInput";
import { EditActivityModal } from "@/components/ux/EditActivityModal";
import { useActivityHistoryStore } from "@/stores/useActivityHistoryStore";
import { useActivityStore } from "@/stores/useActivityStore";

type AddEventAutocompleteInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (item: AutocompleteItem) => void;
  initialItem?: AutocompleteItem;
};

export function AddEventAutocompleteInput({
  value,
  onChangeText,
  onSelect,
  initialItem,
}: AddEventAutocompleteInputProps) {
  const rawItems = useActivityHistoryStore((s) => s.items);
  const addItem = useActivityHistoryStore((s) => s.addItem);
  const renameItem = useActivityHistoryStore((s) => s.renameItem);
  const removeItem = useActivityHistoryStore((s) => s.removeItem);
  const renameActivityTitle = useActivityStore((s) => s.renameActivityTitle);

  const [editingItem, setEditingItem] = useState<AutocompleteItem | null>(null);

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

  const handleEditConfirm = useCallback(
    async (newName: string) => {
      if (!editingItem) return;
      const historyEntry = rawItems.find((i) => i.id === editingItem.id);
      if (!historyEntry) return;
      await Promise.all([
        renameActivityTitle(historyEntry.name, newName),
        renameItem(historyEntry.id, newName),
      ]);
      setEditingItem(null);
    },
    [editingItem, rawItems, renameActivityTitle, renameItem],
  );

  return (
    <>
      <AutocompleteTextInput
        items={historyItems}
        value={value}
        onChangeText={onChangeText}
        onSelect={onSelect}
        onCreate={handleCreate}
        onEdit={setEditingItem}
        onDelete={(item) => removeItem(item.id)}
        placeholder="Add Title"
        TextInputComponent={BottomSheetTextInput}
        initialItem={initialItem}
      />
      <EditActivityModal
        visible={editingItem !== null}
        initialName={editingItem?.label ?? ""}
        onConfirm={handleEditConfirm}
        onCancel={() => setEditingItem(null)}
      />
    </>
  );
}
