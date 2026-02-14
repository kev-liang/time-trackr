import { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  CalendarProvider,
  CalendarUtils,
  ExpandableCalendar,
  Timeline,
  TimelineList,
  type TimelineProps,
} from "react-native-calendars";
import type { TimelineListRenderItemInfo } from "react-native-calendars/src/timeline-list";

import { AppText } from "@/components/ux/AppText";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useActivityStore, type Activity } from "@/stores/useActivityStore";
import { colors, fonts } from "@/theme";

const INITIAL_TIME = { hour: 9, minutes: 0 };

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

/** Turn "#4A90D9" into "rgba(74,144,217,0.12)" */
function toFadedBg(hex: string, opacity = 0.12): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function formatTime(isoish: string): string {
  const timePart = isoish.split(" ")[1] ?? "";
  return timePart.replace(":", ".");
}

type PackedEvent = {
  id?: string;
  start: string;
  end: string;
  title: string;
  color?: string;
  height: number;
};

export function ActivityTimeline() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = colors[colorScheme];
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

  const renderEvent = useCallback(
    (event: PackedEvent) => {
      const accent = event.color ?? theme.tint;
      const showTime = event.height > 40;

      return (
        <View
          style={[
            styles.eventBlock,
            {
              backgroundColor: toFadedBg(accent),
              borderLeftColor: accent,
            },
          ]}
        >
          {showTime && (
            <AppText variant="caption" color={theme.textSecondary}>
              {formatTime(event.start)}
            </AppText>
          )}
          <AppText
            variant="bodySemiBold"
            color={theme.text}
            style={styles.eventTitle}
            numberOfLines={1}
          >
            {event.title}
          </AppText>
        </View>
      );
    },
    [theme],
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
      renderEvent,
      theme: {
        calendarBackground: theme.background,
        timeLabel: {
          color: theme.textSecondary,
          fontFamily: fonts.regular,
          fontSize: 11,
        },
        line: { backgroundColor: theme.border },
        nowIndicatorLine: { backgroundColor: "#EF4444" },
        nowIndicatorKnob: { backgroundColor: "#EF4444" },
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
    [theme, renderEvent],
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

  return (
    <CalendarProvider date={today} showTodayButton disabledOpacity={0.6}>
      <ExpandableCalendar
        firstDay={1}
        markedDates={markedDates}
        theme={{
          calendarBackground: theme.background,
          dayTextColor: theme.text,
          monthTextColor: theme.text,
          textSectionTitleColor: theme.textSecondary,
          todayTextColor: theme.tint,
          selectedDayBackgroundColor: theme.tint,
          selectedDayTextColor: theme.background,
          dotColor: theme.tint,
          arrowColor: theme.tint,
          textDayFontFamily: fonts.regular,
          textMonthFontFamily: fonts.semiBold,
          textDayHeaderFontFamily: fonts.medium,
          // @ts-expect-error -- stylesheet keys accepted by the calendar
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
              backgroundColor: theme.tint,
            },
          },
        }}
      />
      <TimelineList
        events={eventsByDate}
        timelineProps={timelineProps}
        renderItem={renderTimelineItem}
        showNowIndicator
        scrollToFirst
        initialTime={INITIAL_TIME}
      />
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  eventBlock: {
    flex: 1,
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 4,
  },
  eventTitle: {
    fontSize: 14,
  },
});
