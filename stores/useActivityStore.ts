import { create } from "zustand";

import * as api from "@/lib/supabase-activities";

export type Activity = {
  id: string;
  title: string;
  /** ISO datetime string, e.g. "2025-02-12 09:00" */
  start: string;
  /** ISO datetime string, e.g. "2025-02-12 10:30" */
  end: string;
  color: string;
};

type ActivityStore = {
  activities: Activity[];
  loadActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, "id">) => Promise<void>;
  removeActivity: (id: string) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Omit<Activity, "id">>) => Promise<void>;
};

export const useActivityStore = create<ActivityStore>((set) => ({
  activities: [],

  loadActivities: async () => {
    const activities = await api.fetchActivities();
    set({ activities });
  },

  addActivity: async (activity) => {
    const created = await api.insertActivity(activity);
    set((state) => ({ activities: [...state.activities, created] }));
  },

  removeActivity: async (id) => {
    await api.deleteActivity(id);
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }));
  },

  updateActivity: async (id, updates) => {
    await api.updateActivity(id, updates);
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      ),
    }));
  },
}));
