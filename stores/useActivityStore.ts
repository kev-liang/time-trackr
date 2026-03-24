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
  isLoading: boolean;
  loadActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, "id">) => Promise<void>;
  removeActivity: (id: string) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Omit<Activity, "id">>) => void;
  renameActivityTitle: (oldTitle: string, newTitle: string) => Promise<void>;
  recolorActivitiesByTitle: (title: string, color: string) => Promise<void>;
};

export const useActivityStore = create<ActivityStore>((set) => ({
  activities: [],
  isLoading: true,

  loadActivities: async () => {
    set({ isLoading: true });
    const activities = await api.fetchActivities();
    set({ activities, isLoading: false });
    analytics.capture("activities_loaded", { count: activities.length });
  },

  addActivity: async (activity) => {
    const created = await api.insertActivity(activity);
    set((state) => ({ activities: [...state.activities, created] }));
    analytics.capture("activity_created", {
      duration_minutes: Math.round(
        durationMinutes(activity.start, activity.end),
      ),
      color: activity.color,
    });
  },

  removeActivity: async (id) => {
    await api.deleteActivity(id);
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    }));
    analytics.capture("activity_deleted");
  },

  updateActivity: (id, updates) => {
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      ),
    }));
    // await api.updateActivity(id, updates);
    analytics.capture("activity_updated", {
      fields_changed: Object.keys(updates),
    });
  },

  renameActivityTitle: async (oldTitle, newTitle) => {
    await api.bulkRenameActivities(oldTitle, newTitle);
    set((state) => ({
      activities: state.activities.map((a) =>
        a.title === oldTitle ? { ...a, title: newTitle } : a,
      ),
    }));
  },

  recolorActivitiesByTitle: async (title, color) => {
    set((state) => ({
      activities: state.activities.map((a) =>
        a.title === title ? { ...a, color } : a,
      ),
    }));
    await api.bulkRecolorActivities(title, color);
  },
}));
