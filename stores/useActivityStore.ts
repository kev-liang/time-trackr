import { create } from "zustand";

import { analytics } from "@/lib/analytics";
import * as api from "@/lib/supabase-activities";
import { durationMinutes } from "@/utils/activityTime";

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
    analytics.capture("activities_loaded", { count: activities.length });
  },

  addActivity: async (activity) => {
    const created = await api.insertActivity(activity);
    set((state) => ({ activities: [...state.activities, created] }));
    analytics.capture("activity_created", { duration_minutes: Math.round(durationMinutes(activity.start, activity.end)), color: activity.color });
  },

  removeActivity: async (id) => {
    await api.deleteActivity(id);
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }));
    analytics.capture("activity_deleted");
  },

  updateActivity: async (id, updates) => {
    await api.updateActivity(id, updates);
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      ),
    }));
    analytics.capture("activity_updated", { fields_changed: Object.keys(updates) });
  },
}));
