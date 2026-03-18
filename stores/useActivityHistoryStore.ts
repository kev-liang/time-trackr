import { create } from "zustand";

import * as api from "@/lib/supabase-activity-history";

export type ActivityHistoryItem = {
  id: string;
  name: string;
  color?: string;
  lastUsed?: string;
  pinned: boolean;
};

type ActivityHistoryStore = {
  items: ActivityHistoryItem[];
  loadItems: () => Promise<void>;
  addItem: (item: Omit<ActivityHistoryItem, "id">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  updateLastUsed: (id: string, date: string) => Promise<void>;
  renameItem: (id: string, name: string) => Promise<void>;
};

export const useActivityHistoryStore = create<ActivityHistoryStore>(
  (set, get) => ({
    items: [],

    loadItems: async () => {
      const items = await api.fetchActivityHistory();
      set({ items });
    },

    addItem: async (item) => {
      const created = await api.insertActivityHistoryItem(item);
      set((state) => ({ items: [...state.items, created] }));
    },

    removeItem: async (id) => {
      await api.deleteActivityHistoryItem(id);
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      }));
    },

    togglePin: async (id) => {
      const item = get().items.find((i) => i.id === id);
      if (!item) return;
      const newPinned = !item.pinned;
      await api.updateActivityHistoryItem(id, { pinned: newPinned });
      set((state) => ({
        items: state.items.map((i) =>
          i.id === id ? { ...i, pinned: newPinned } : i,
        ),
      }));
    },

    updateLastUsed: async (id, date) => {
      await api.updateActivityHistoryItem(id, { last_used: date });
      set((state) => {
        const updated = state.items.map((i) =>
          i.id === id ? { ...i, lastUsed: date } : i,
        );
        updated.sort((a, b) => {
          if (!a.lastUsed && !b.lastUsed) return 0;
          if (!a.lastUsed) return 1;
          if (!b.lastUsed) return -1;
          return b.lastUsed.localeCompare(a.lastUsed);
        });
        return { items: updated };
      });
    },

    renameItem: async (id, name) => {
      await api.updateActivityHistoryItem(id, { name });
      set((state) => ({
        items: state.items.map((i) =>
          i.id === id ? { ...i, name } : i,
        ),
      }));
    },
  }),
);
