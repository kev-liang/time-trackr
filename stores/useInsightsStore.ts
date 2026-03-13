import { useMemo } from "react";
import { create } from "zustand";

import {
  buildActivityTotals,
  buildDaySlots,
  buildHourSlots,
  formatDateTitle,
  formatWeekTitle,
  getWeekStart,
} from "@/components/insights/insightsUtils";
import { useActivityStore } from "@/stores/useActivityStore";

export type Period = "day" | "week";

type InsightsStore = {
  period: Period;
  selectedDate: Date;
  setPeriod: (period: Period) => void;
  setSelectedDate: (date: Date) => void;
  goToNext: () => void;
  goToPrev: () => void;
};

export const useInsightsStore = create<InsightsStore>((set, get) => ({
  period: "day",
  selectedDate: new Date(),

  setPeriod: (period) => set({ period }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  goToNext: () => {
    const { selectedDate, period } = get();
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (period === "week" ? 7 : 1));
    set({ selectedDate: d });
  },

  goToPrev: () => {
    const { selectedDate, period } = get();
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - (period === "week" ? 7 : 1));
    set({ selectedDate: d });
  },
}));

/** Combines insights navigation state with activity data to produce all derived values. */
export function useInsightsData() {
  const activities = useActivityStore((s) => s.activities);
  const period = useInsightsStore((s) => s.period);
  const selectedDate = useInsightsStore((s) => s.selectedDate);

  // --- Day ---
  const todayActivities = useMemo(() => {
    const dateStr = selectedDate.toDateString();
    return activities.filter(
      (a) => new Date(a.start).toDateString() === dateStr,
    );
  }, [activities, selectedDate]);

  const hourSlots = useMemo(
    () => buildHourSlots(todayActivities),
    [todayActivities],
  );

  const dayActivityTotals = useMemo(
    () => buildActivityTotals(todayActivities),
    [todayActivities],
  );

  // --- Week ---
  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);

  const weekActivities = useMemo(() => {
    const weekEndMs = new Date(weekStart);
    weekEndMs.setDate(weekEndMs.getDate() + 6);
    weekEndMs.setHours(23, 59, 59, 999);
    return activities.filter((a) => {
      const start = new Date(a.start);
      return start >= weekStart && start <= weekEndMs;
    });
  }, [activities, weekStart]);

  const daySlots = useMemo(
    () => buildDaySlots(weekStart, weekActivities),
    [weekStart, weekActivities],
  );

  const maxMinutes = useMemo(() => {
    const totals = daySlots.map((s) =>
      s.segments.reduce((sum, seg) => sum + seg.minutes, 0),
    );
    return Math.max(0, ...totals);
  }, [daySlots]);

  const weekActivityTotals = useMemo(
    () => buildActivityTotals(weekActivities),
    [weekActivities],
  );

  const todayDayIndex = useMemo(() => {
    const today = new Date();
    const todayWeekStart = getWeekStart(today);
    if (todayWeekStart.getTime() === weekStart.getTime()) {
      const day = today.getDay();
      return day === 0 ? 6 : day - 1; // Mon=0 … Sun=6
    }
    return null;
  }, [weekStart]);

  // --- Derived display ---
  const isEmpty =
    period === "day" ? todayActivities.length === 0 : weekActivities.length === 0;

  const dateTitle =
    period === "week"
      ? formatWeekTitle(weekStart)
      : formatDateTitle(selectedDate);

  const activityTotals =
    period === "week" ? weekActivityTotals : dayActivityTotals;

  const isToday =
    period === "day" &&
    selectedDate.toDateString() === new Date().toDateString();

  return {
    todayActivities,
    hourSlots,
    dayActivityTotals,
    weekStart,
    weekActivities,
    daySlots,
    maxMinutes,
    weekActivityTotals,
    todayDayIndex,
    isEmpty,
    dateTitle,
    activityTotals,
    isToday,
  };
}
