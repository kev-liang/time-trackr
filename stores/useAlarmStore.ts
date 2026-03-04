import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { analytics } from "@/lib/analytics";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type DaySchedule = {
  active: boolean;
  startTime: string;
  endTime: string;
};

export const WEEKDAYS: Weekday[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

type FrequencyUnit = "minutes" | "hours";

export type AlarmState = {
  enabled: boolean;
  mutedUntil: string | null;
  frequency: number;
  frequencyUnit: FrequencyUnit;
  schedule: Record<Weekday, DaySchedule>;
};

type AlarmActions = {
  setEnabled: (enabled: boolean) => void;
  muteUntil: (until: string | null) => void;
  setFrequencyValue: (value: number) => void;
  setFrequencyUnit: (unit: FrequencyUnit) => void;
  toggleDay: (day: Weekday) => void;
  setDayStartTime: (day: Weekday, time: string) => void;
  setDayEndTime: (day: Weekday, time: string) => void;
  clearExpiredMute: () => void;
};

const defaultSchedule: Record<Weekday, DaySchedule> = {
  Mon: { active: true, startTime: "09:00", endTime: "17:00" },
  Tue: { active: true, startTime: "09:00", endTime: "17:00" },
  Wed: { active: true, startTime: "09:00", endTime: "17:00" },
  Thu: { active: true, startTime: "09:00", endTime: "17:00" },
  Fri: { active: true, startTime: "09:00", endTime: "17:00" },
  Sat: { active: false, startTime: "09:00", endTime: "17:00" },
  Sun: { active: false, startTime: "09:00", endTime: "17:00" },
};

export const useAlarmStore = create<AlarmState & AlarmActions>()(
  persist(
    (set, get) => ({
      enabled: true,
      mutedUntil: null,
      frequency: 30,
      frequencyUnit: "minutes",
      schedule: defaultSchedule,

      setEnabled: (enabled) => {
        set({ enabled });
        analytics.capture("alarm_toggled", { enabled });
      },

      muteUntil: (until) => {
        set({ mutedUntil: until });
        if (until) analytics.capture("alarm_muted");
      },

      setFrequencyValue: (value) => {
        set({ frequency: value });
        analytics.capture("alarm_frequency_changed", { value, unit: get().frequencyUnit });
      },

      setFrequencyUnit: (unit) => {
        set({ frequencyUnit: unit });
        analytics.capture("alarm_frequency_changed", { value: get().frequency, unit });
      },

      toggleDay: (day) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            [day]: { ...state.schedule[day], active: !state.schedule[day].active },
          },
        })),

      setDayStartTime: (day, time) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            [day]: { ...state.schedule[day], startTime: time },
          },
        })),

      setDayEndTime: (day, time) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            [day]: { ...state.schedule[day], endTime: time },
          },
        })),

      clearExpiredMute: () => {
        const { mutedUntil } = get();
        if (mutedUntil && new Date(mutedUntil) <= new Date()) {
          set({ mutedUntil: null });
        }
      },
    }),
    {
      name: "alarm-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        mutedUntil: state.mutedUntil,
        frequency: state.frequency,
        frequencyUnit: state.frequencyUnit,
        schedule: state.schedule,
      }),
    }
  )
);
