import { useCallback, useMemo } from "react";
import {
  CalendarUtils,
  Timeline,
  type TimelineProps,
} from "react-native-calendars";
import type { TimelineListRenderItemInfo } from "react-native-calendars/src/timeline-list";

import { useActivityStore, type Activity } from "@/stores/useActivityStore";
import { colors, fonts } from "@/theme";

const NOW_COLOR = "#EF4444";

/** Group activities by date key ("YYYY-MM-DD") */
function groupByDate(activities: Activity[]) {
  const grouped: { [date: string]: TimelineProps["events"] } = {};
  for (const a of activities) {
    const dateKey = CalendarUtils.getCalendarDateString(a.start);
    const event = {
      id: a.id,
      start: a.start,
      end: a.end,
      title: a.title,
      color: a.color,
    };
    if (grouped[dateKey]) {
      grouped[dateKey].push(event);
    } else {
      grouped[dateKey] = [event];
    }
  }
  return grouped;
}

export function useActivityTimeline() {
  const activities = useActivityStore((s) => s.activities);

  const today = CalendarUtils.getCalendarDateString(new Date());

  const eventsByDate = useMemo(() => groupByDate(activities), [activities]);

  const markedDates = useMemo(() => {
    const marks: { [date: string]: { marked: boolean } } = {};
    for (const date of Object.keys(eventsByDate)) {
      marks[date] = { marked: true };
    }
    return marks;
  }, [eventsByDate]);

  const calendarTheme = useMemo(
    () => ({
      calendarBackground: colors.background,
      dayTextColor: colors.text,
      monthTextColor: colors.text,
      textSectionTitleColor: colors.textSecondary,
      todayTextColor: colors.tint,
      selectedDayBackgroundColor: colors.tint,
      selectedDayTextColor: colors.background,
      dotColor: colors.tint,
      arrowColor: colors.tint,
      textDayFontFamily: fonts.regular,
      textMonthFontFamily: fonts.semiBold,
      textDayHeaderFontFamily: fonts.medium,
      "stylesheet.day.basic": {
        base: {
          width: 36,
          height: 36,
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 8,
        },
        selected: {
          borderRadius: 16,
          backgroundColor: colors.tint,
        },
      },
    }),
    [],
  );

  const timelineProps: Partial<TimelineProps> = useMemo(
    () => ({
      format24h: true,
      unavailableHours: [
        { start: 0, end: 6 },
        { start: 22, end: 24 },
      ],
      overlapEventsSpacing: 8,
      rightEdgeSpacing: 24,
      theme: {
        calendarBackground: colors.background,
        timeLabel: {
          color: colors.textSecondary,
          fontFamily: fonts.regular,
          fontSize: 11,
        },
        line: { backgroundColor: colors.border },
        nowIndicatorLine: { backgroundColor: NOW_COLOR },
        nowIndicatorKnob: { backgroundColor: NOW_COLOR },
        event: {
          borderRadius: 0,
          borderWidth: 0,
          backgroundColor: "transparent",
          paddingLeft: 0,
          paddingTop: 0,
          paddingBottom: 0,
        },
      },
    }),
    [],
  );

  // Workaround: react-native-calendars spreads `key` via props object
  // which React 19 forbids. Extract it and pass as a direct JSX prop.
  const renderTimelineItem = useCallback(
    (props: TimelineProps, _info: TimelineListRenderItemInfo) => {
      const { key, ...rest } = props as TimelineProps & { key?: string };
      return <Timeline key={key} {...rest} />;
    },
    [],
  );

  return {
    today,
    eventsByDate,
    markedDates,
    calendarTheme,
    timelineProps,
    renderTimelineItem,
  };
}
