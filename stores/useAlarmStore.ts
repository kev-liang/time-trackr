import { create } from "zustand";

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

type AlarmState = {
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

export const useAlarmStore = create<AlarmState & AlarmActions>((set) => ({
  enabled: true,
  mutedUntil: null,
  frequency: 30,
  frequencyUnit: "minutes",
  schedule: defaultSchedule,

  setEnabled: (enabled) => set({ enabled }),

  muteUntil: (until) => set({ mutedUntil: until }),

  setFrequencyValue: (value) => set({ frequency: value }),

  setFrequencyUnit: (unit) => set({ frequencyUnit: unit }),

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
}));
