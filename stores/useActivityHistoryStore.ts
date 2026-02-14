import { create } from "zustand";

export type ActivityHistoryItem = {
  id: string;
  name: string;
  lastUsed?: string;
  pinned: boolean;
};

type ActivityHistoryStore = {
  items: ActivityHistoryItem[];
  addItem: (item: ActivityHistoryItem) => void;
  removeItem: (id: string) => void;
  togglePin: (id: string) => void;
  updateLastUsed: (id: string, date: string) => void;
};

export const useActivityHistoryStore = create<ActivityHistoryStore>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  togglePin: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, pinned: !i.pinned } : i,
      ),
    })),

  updateLastUsed: (id, date) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, lastUsed: date } : i,
      ),
    })),
}));
