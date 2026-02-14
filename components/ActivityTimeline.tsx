import { useCallback } from "react";
import {
  CalendarProvider,
  ExpandableCalendar,
  TimelineList,
} from "react-native-calendars";

import { ActivityTimelineEvent } from "@/components/ActivityTimelineEvent";
import { useActivityTimeline } from "@/hooks/useActivityTimeline";
import { colors } from "@/theme";

const INITIAL_TIME = { hour: 9, minutes: 0 };

type PackedEvent = {
  id?: string;
  start: string;
  end: string;
  title: string;
  color?: string;
  height: number;
};

export function ActivityTimeline() {
  const {
    today,
    eventsByDate,
    markedDates,
    calendarTheme,
    timelineProps,
    renderTimelineItem,
  } = useActivityTimeline();

  const renderEvent = useCallback(
    (event: PackedEvent) => (
      <ActivityTimelineEvent
        title={event.title}
        start={event.start}
        color={event.color ?? colors.tint}
        height={event.height}
        textColor={colors.text}
        secondaryTextColor={colors.textSecondary}
      />
    ),
    [],
  );

  const mergedTimelineProps = {
    ...timelineProps,
    renderEvent,
  };

  return (
    <CalendarProvider date={today} showTodayButton disabledOpacity={0.6}>
      <ExpandableCalendar
        firstDay={1}
        markedDates={markedDates}
        theme={calendarTheme}
      />
      <TimelineList
        events={eventsByDate}
        timelineProps={mergedTimelineProps}
        renderItem={renderTimelineItem}
        showNowIndicator
        scrollToFirst
        initialTime={INITIAL_TIME}
      />
    </CalendarProvider>
  );
}
