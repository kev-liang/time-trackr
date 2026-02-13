import { create } from 'zustand';

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
  addActivity: (activity: Activity) => void;
  removeActivity: (id: string) => void;
  updateActivity: (id: string, updates: Partial<Omit<Activity, 'id'>>) => void;
};

export const useActivityStore = create<ActivityStore>((set) => ({
  activities: [],

  addActivity: (activity) =>
    set((state) => ({ activities: [...state.activities, activity] })),

  removeActivity: (id) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    })),

  updateActivity: (id, updates) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
}));
