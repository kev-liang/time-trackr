import { useCallback } from "react";
import {
  CalendarProvider,
  ExpandableCalendar,
  TimelineList,
} from "react-native-calendars";

import { ActivityTimelineEvent } from "@/components/ActivityTimelineEvent";
import { useActivityTimeline } from "@/hooks/useActivityTimeline";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { MS_PER_MINUTE } from "@/utils/activityTime";
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
        id={event.id}
        title={event.title}
        start={event.start}
        end={event.end}
        color={event.color ?? colors.tint}
        height={event.height}
        textColor={colors.text}
        secondaryTextColor={colors.textSecondary}
      />
    ),
    [],
  );

  const handleBackgroundLongPress = useCallback(
    (timeString: string, timeObject: { date?: string }) => {
      const store = useActivityEditStore.getState();
      const date = timeObject.date ?? today;
      const [hours, minutes] = timeString.split(":").map(Number);
      const start = new Date(date);
      start.setHours(hours, minutes, 0, 0);
      const end = new Date(start.getTime() + 60 * MS_PER_MINUTE);
      store.clearEditing();
      store.setDefaults(start, end);
      store.openSheet();
    },
    [today],
  );

  const mergedTimelineProps = {
    ...timelineProps,
    renderEvent,
    onBackgroundLongPress: handleBackgroundLongPress,
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
