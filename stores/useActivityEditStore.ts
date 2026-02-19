import { create } from "zustand";

type ActivityEditStore = {
  editingEventId: string | null;
  defaultStart: Date | undefined;
  defaultEnd: Date | undefined;
  sheetOpen: boolean;
  hasDraft: boolean;
  setEditingEventId: (id: string | null) => void;
  setDefaults: (start: Date | undefined, end: Date | undefined) => void;
  openSheet: () => void;
  clearEditing: () => void;
  openCreate: (start: Date, end: Date) => void;
  updateDraft: (start: Date, end: Date) => void;
  setHasDraft: (hasDraft: boolean) => void;
};

export const useActivityEditStore = create<ActivityEditStore>((set) => ({
  editingEventId: null,
  defaultStart: undefined,
  defaultEnd: undefined,
  sheetOpen: false,
  hasDraft: false,

  setEditingEventId: (id) => set({ editingEventId: id }),

  setDefaults: (start, end) => set({ defaultStart: start, defaultEnd: end }),

  openSheet: () => set({ sheetOpen: true }),
  setHasDraft: (_hasDraft) => set({ hasDraft: _hasDraft }),
  clearEditing: () =>
    set({
      editingEventId: null,
      defaultStart: undefined,
      defaultEnd: undefined,
      sheetOpen: false,
      hasDraft: false,
    }),

  openCreate: (start, end) =>
    set({
      editingEventId: null,
      defaultStart: start,
      defaultEnd: end,
      sheetOpen: true,
      hasDraft: true,
    }),

  updateDraft: (start, end) => set({ defaultStart: start, defaultEnd: end }),
}));
