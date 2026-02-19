import { useMemo } from "react";

import { useActivityStore } from "@/stores/useActivityStore";
import { activitiesToEvents } from "@/utils/activityAdapter";
import { colors, fonts } from "@/theme";

import type { EventItem, UnavailableHourProps } from "@howljs/calendar-kit";

const NOW_COLOR = "#EF4444";

export function useActivityTimeline() {
  const activities = useActivityStore((s) => s.activities);

  const events: EventItem[] = useMemo(
    () => activitiesToEvents(activities),
    [activities],
  );

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const theme = useMemo(
    () => ({
      colors: {
        primary: colors.tint,
        onPrimary: colors.background,
        background: colors.background,
        onBackground: colors.text,
        border: colors.border,
        text: colors.text,
        surface: colors.surface,
        onSurface: colors.textSecondary,
      },
      nowIndicatorColor: NOW_COLOR,
      hourTextStyle: {
        color: colors.textSecondary,
        fontFamily: fonts.regular,
        fontSize: 11,
      },
      unavailableHourBackgroundColor: colors.surface,
    }),
    [],
  );

  const unavailableHours: UnavailableHourProps[] = useMemo(
    () => [
      { start: 0, end: 360 },
      { start: 1320, end: 1440 },
    ],
    [],
  );

  return { events, today, theme, unavailableHours };
}
