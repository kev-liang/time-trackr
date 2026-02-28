import { create } from "zustand";

type ActivityEditStore = {
  editingEventId: string | null;
  draftStart: Date | undefined;
  draftEnd: Date | undefined;
  previewStart: Date | undefined;
  previewEnd: Date | undefined;
  sheetOpen: boolean;
  hasDraft: boolean;
  setEditingEventId: (id: string | null) => void;
  setDraftTimes: (start: Date | undefined, end: Date | undefined) => void;
  setPreview: (start: Date, end: Date) => void;
  clearPreview: () => void;
  openSheet: () => void;
  clearEditing: () => void;
  openCreate: (start: Date, end: Date) => void;
  updateDraft: (start: Date, end: Date) => void;
  setHasDraft: (hasDraft: boolean) => void;
};

export const useActivityEditStore = create<ActivityEditStore>((set) => ({
  editingEventId: null,
  draftStart: undefined,
  draftEnd: undefined,
  previewStart: undefined,
  previewEnd: undefined,
  sheetOpen: false,
  hasDraft: false,

  setEditingEventId: (id) => set({ editingEventId: id }),

  setDraftTimes: (start, end) => set({ draftStart: start, draftEnd: end }),

  setPreview: (start, end) => set({ previewStart: start, previewEnd: end }),

  clearPreview: () => set({ previewStart: undefined, previewEnd: undefined }),

  openSheet: () => set({ sheetOpen: true }),
  setHasDraft: (_hasDraft) => set({ hasDraft: _hasDraft }),
  clearEditing: () =>
    set({
      editingEventId: null,
      draftStart: undefined,
      draftEnd: undefined,
      previewStart: undefined,
      previewEnd: undefined,
      sheetOpen: false,
      hasDraft: false,
    }),

  openCreate: (start, end) =>
    set({
      editingEventId: null,
      draftStart: start,
      draftEnd: end,
      previewStart: undefined,
      previewEnd: undefined,
      sheetOpen: true,
      hasDraft: true,
    }),

  updateDraft: (start, end) =>
    set({
      draftStart: start,
      draftEnd: end,
      previewStart: undefined,
      previewEnd: undefined,
    }),
}));
