export const NOTIFICATION_ACTIONS = {
  LOG_TIME: "log-time",
} as const;

export const ACTIVITY_COLORS = {
  blue: "#4293ff",
  orange: "#ff9142",
  green: "#42ff87",
  red: "#ff4f42",
  purple: "#8e42ff",
  pink: "#ff42a7",
} as const;

export type ActivityColor = keyof typeof ACTIVITY_COLORS;
