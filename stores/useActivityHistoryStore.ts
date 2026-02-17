import { create } from "zustand";

import * as api from "@/lib/supabase-activity-history";

export type ActivityHistoryItem = {
  id: string;
  name: string;
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
};

export const useActivityHistoryStore = create<ActivityHistoryStore>((set, get) => ({
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
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, lastUsed: date } : i,
      ),
    }));
  },
}));
