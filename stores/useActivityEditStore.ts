import { create } from "zustand";

type ActivityEditStore = {
  editingEventId: string | null;
  setEditingEventId: (id: string | null) => void;
  clearEditing: () => void;
};

export const useActivityEditStore = create<ActivityEditStore>((set) => ({
  editingEventId: null,

  setEditingEventId: (id) => set({ editingEventId: id }),

  clearEditing: () => set({ editingEventId: null }),
}));
