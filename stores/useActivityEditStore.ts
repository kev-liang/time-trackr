import { create } from "zustand";

type ActivityEditStore = {
  editingEventId: string | null;
  defaultStart: Date | undefined;
  defaultEnd: Date | undefined;
  sheetOpen: boolean;
  /** Whether a ghost/draft event should be shown on the timeline */
  hasDraft: boolean;
  setEditingEventId: (id: string | null) => void;
  setDefaults: (start: Date | undefined, end: Date | undefined) => void;
  openSheet: () => void;
  clearEditing: () => void;
  /** Open the create sheet with a ghost event at the given time range */
  openCreate: (start: Date, end: Date) => void;
  /** Update the draft ghost times (e.g. after the user drags to resize) */
  updateDraft: (start: Date, end: Date) => void;
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
