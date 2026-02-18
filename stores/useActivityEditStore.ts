import { create } from "zustand";

type ActivityEditStore = {
  editingEventId: string | null;
  defaultStart: Date | undefined;
  defaultEnd: Date | undefined;
  sheetOpen: boolean;
  setEditingEventId: (id: string | null) => void;
  setDefaults: (start: Date | undefined, end: Date | undefined) => void;
  openSheet: () => void;
  clearEditing: () => void;
};

export const useActivityEditStore = create<ActivityEditStore>((set) => ({
  editingEventId: null,
  defaultStart: undefined,
  defaultEnd: undefined,
  sheetOpen: false,

  setEditingEventId: (id) => set({ editingEventId: id }),

  setDefaults: (start, end) => set({ defaultStart: start, defaultEnd: end }),

  openSheet: () => set({ sheetOpen: true }),

  clearEditing: () =>
    set({
      editingEventId: null,
      defaultStart: undefined,
      defaultEnd: undefined,
      sheetOpen: false,
    }),
}));
