import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { AppText } from "@/components/ux/AppText";
import {
  AutocompleteTextInput,
  type AutocompleteItem,
} from "@/components/ux/AutocompleteTextInput";
import { ConfirmationModal } from "@/components/ux/ConfirmationModal";
import { EditActivityModal } from "@/components/ux/EditActivityModal";
import { FREE_LIMIT } from "@/components/ux/FreemiumBanner";
import { useActivityHistoryStore } from "@/stores/useActivityHistoryStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";

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
  const isPro = useSubscriptionStore((s) => s.isPro);
  const addItem = useActivityHistoryStore((s) => s.addItem);
  const renameItem = useActivityHistoryStore((s) => s.renameItem);
  const removeItem = useActivityHistoryStore((s) => s.removeItem);
  const updateLastUsed = useActivityHistoryStore((s) => s.updateLastUsed);
  const renameActivityTitle = useActivityStore((s) => s.renameActivityTitle);
  const recolorActivitiesByTitle = useActivityStore(
    (s) => s.recolorActivitiesByTitle,
  );
  const updateItemColor = useActivityHistoryStore((s) => s.updateItemColor);

  const [editingItem, setEditingItem] = useState<AutocompleteItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<AutocompleteItem | null>(
    null,
  );

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
        if (!isPro && rawItems.length >= FREE_LIMIT) {
          router.push({ pathname: "/paywall", params: { source: "freemium" } });
          return;
        }
        addItem({
          name: label,
          pinned: false,
          color,
          lastUsed: new Date().toISOString(),
        });
      }
    },
    [rawItems, addItem, isPro],
  );

  const handleSelect = useCallback(
    (item: AutocompleteItem) => {
      if (!item.id.startsWith("created:")) {
        updateLastUsed(item.id, new Date().toISOString());
      }
      onSelect(item);
    },
    [onSelect, updateLastUsed],
  );

  const handleEditConfirm = useCallback(
    async (newName: string, newColor: string) => {
      if (!editingItem) return;
      const historyEntry = rawItems.find((i) => i.id === editingItem.id);
      if (!historyEntry) return;
      const ops: Promise<void>[] = [];
      if (newName !== historyEntry.name) {
        ops.push(renameActivityTitle(historyEntry.name, newName));
        ops.push(renameItem(historyEntry.id, newName));
      }
      if (newColor !== historyEntry.color) {
        ops.push(recolorActivitiesByTitle(historyEntry.name, newColor));
        ops.push(updateItemColor(historyEntry.id, newColor));
      }
      await Promise.all(ops);
      setEditingItem(null);
    },
    [
      editingItem,
      rawItems,
      renameActivityTitle,
      renameItem,
      recolorActivitiesByTitle,
      updateItemColor,
    ],
  );

  return (
    <>
      <AutocompleteTextInput
        items={historyItems}
        value={value}
        onChangeText={onChangeText}
        onSelect={handleSelect}
        onCreate={handleCreate}
        onEdit={setEditingItem}
        onDelete={setDeletingItem}
        placeholder="Add Title"
        TextInputComponent={BottomSheetTextInput}
        initialItem={initialItem}
      />
      <EditActivityModal
        visible={editingItem !== null}
        initialName={editingItem?.label ?? ""}
        initialColor={editingItem?.color}
        onConfirm={handleEditConfirm}
        onCancel={() => setEditingItem(null)}
      />
      <ConfirmationModal
        visible={deletingItem !== null}
        title="Remove Suggestion"
        body={
          <>
            <AppText variant="body" color="textSecondary">
              This will be removed from your autocomplete suggestions.
            </AppText>
            <AppText variant="body" color="textSecondary">
              Your logged activities and insights won't be affected.
            </AppText>
          </>
        }
        onDelete={() => {
          if (deletingItem) removeItem(deletingItem.id);
          setDeletingItem(null);
        }}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
}
