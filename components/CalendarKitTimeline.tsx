import { Ionicons } from "@expo/vector-icons";
import {
  CalendarBody,
  CalendarContainer,
  CalendarHeader,
  DraggableEvent,
  DraggingEvent,
  type CalendarKitHandle,
  type DateOrDateTime,
  type DraggableEventProps,
  type DraggingEventProps,
  type OnEventResponse,
  type PackedEvent,
  type SelectedEventType,
  type SizeAnimation,
} from "@howljs/calendar-kit";
import moment from "moment";
import { Calendar, CalendarUtils } from "react-native-calendars";
import type { DateData } from "react-native-calendars";
import { useCallback, useMemo, useRef, useState } from "react";
import type { GestureResponderEvent } from "react-native";
import { Pressable, StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import { CalendarKitEvent } from "@/components/CalendarKitEvent";
import { AppText } from "@/components/ux/AppText";
import { useCalendarKit } from "@/hooks/useCalendarKit";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { colors, fonts } from "@/theme";
import { MS_PER_MINUTE } from "@/utils/activityTime";
import { extractTimes } from "@/utils/calendarKitAdapter";

export function CalendarKitTimeline() {
  const calendarRef = useRef<CalendarKitHandle>(null);
  const { events, today, theme, unavailableHours } = useCalendarKit();
  const [visibleDate, setVisibleDate] = useState(today);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(today);

  const editingEventId = useActivityEditStore((s) => s.editingEventId);

  const selectedEvent: SelectedEventType | undefined = useMemo(() => {
    if (!editingEventId) return undefined;
    const found = events.find((e) => e.id === editingEventId);
    if (!found) return undefined;
    return found as SelectedEventType;
  }, [editingEventId, events]);

  const handlePressEvent = useCallback((event: OnEventResponse) => {
    const store = useActivityEditStore.getState();
    store.setEditingEventId(event.id);
    store.openSheet();
  }, []);

  const handlePressBackground = useCallback(
    (_props: DateOrDateTime, _event: GestureResponderEvent) => {
      if (pickerOpen) setPickerOpen(false);
    },
    [pickerOpen],
  );

  const handleLongPressBackground = useCallback(
    (props: DateOrDateTime, _event: GestureResponderEvent) => {
      const dateTime = props.dateTime;
      if (!dateTime) return;
      const store = useActivityEditStore.getState();
      const start = new Date(dateTime);
      const end = new Date(start.getTime() + 60 * MS_PER_MINUTE);
      store.clearEditing();
      store.setDefaults(start, end);
      store.openSheet();
    },
    [],
  );

  const handleDragEventEnd = useCallback(async (event: OnEventResponse) => {
    const { start, end } = extractTimes(event);
    await useActivityStore.getState().updateActivity(event.id, { start, end });
  }, []);

  const handleDragSelectedEventEnd = useCallback(
    async (event: SelectedEventType) => {
      if (!event.id) return;
      const start = event.start.dateTime;
      const end = event.end.dateTime;
      if (!start || !end) return;
      await useActivityStore
        .getState()
        .updateActivity(event.id, { start, end });
    },
    [],
  );

  const renderEvent = useCallback(
    (event: PackedEvent, _size: SizeAnimation) => (
      <CalendarKitEvent
        id={event.id}
        title={event.title ?? ""}
        start={event.start.dateTime!}
        color={event.color ?? colors.tint}
      />
    ),
    [],
  );

  const renderSelectedEventContent = useCallback(
    (
      event: SelectedEventType | undefined,
      _options: { width: SharedValue<number>; height: SharedValue<number> },
    ) => {
      if (!event) return null;
      return (
        <CalendarKitEvent
          id={event.id ?? ""}
          title={event.title ?? ""}
          start={event.start.dateTime!}
          color={event.color ?? colors.tint}
        />
      );
    },
    [],
  );

  const renderDraggableEvent = useCallback(
    (props: DraggableEventProps) => (
      <DraggableEvent {...props} renderEvent={renderSelectedEventContent} />
    ),
    [renderSelectedEventContent],
  );

  const renderDraggingEvent = useCallback(
    (props: DraggingEventProps) => (
      <DraggingEvent {...props} renderEvent={renderSelectedEventContent} />
    ),
    [renderSelectedEventContent],
  );

  const activities = useActivityStore((s) => s.activities);

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked?: boolean; dotColor?: string; selected?: boolean; selectedColor?: string }> = {};
    for (const a of activities) {
      const dateKey = CalendarUtils.getCalendarDateString(a.start);
      marks[dateKey] = { marked: true, dotColor: colors.tint };
    }
    marks[visibleDate] = {
      ...marks[visibleDate],
      selected: true,
      selectedColor: colors.tint,
    };
    return marks;
  }, [activities, visibleDate]);

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
          alignItems: "center" as const,
          justifyContent: "center" as const,
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

  const handleDateChanged = useCallback((date: string) => {
    setVisibleDate(date);
  }, []);

  const handleDayPress = useCallback(
    (day: DateData) => {
      setPickerOpen(false);
      setVisibleDate(day.dateString);
      setDisplayMonth(day.dateString);
      calendarRef.current?.goToDate({ date: day.dateString });
    },
    [],
  );

  const handlePrevMonth = useCallback(() => {
    setDisplayMonth((prev) =>
      moment(prev).subtract(1, "month").format("YYYY-MM-DD"),
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setDisplayMonth((prev) =>
      moment(prev).add(1, "month").format("YYYY-MM-DD"),
    );
  }, []);

  return (
    <CalendarContainer
      ref={calendarRef}
      numberOfDays={1}
      events={events}
      initialDate={today}
      scrollToNow
      theme={theme}
      unavailableHours={unavailableHours}
      allowDragToEdit
      dragStep={15}
      selectedEvent={selectedEvent}
      useHaptic
      onPressEvent={handlePressEvent}
      onPressBackground={handlePressBackground}
      onLongPressBackground={handleLongPressBackground}
      onDragEventEnd={handleDragEventEnd}
      onDragSelectedEventEnd={handleDragSelectedEventEnd}
      onDateChanged={handleDateChanged}
      overlapEventsSpacing={8}
      rightEdgeSpacing={0}
      start={0}
      end={1440}
    >
      <Pressable
        onPress={() => {
          setPickerOpen((prev) => {
            if (!prev) setDisplayMonth(visibleDate);
            return !prev;
          });
        }}
        style={styles.datePickerToggle}
      >
        {pickerOpen && (
          <Pressable onPress={handlePrevMonth} style={styles.arrowButton}>
            <Ionicons name="chevron-back" size={20} color={colors.tint} />
          </Pressable>
        )}
        <AppText variant="bodySemiBold" color={colors.text}>
          {moment(pickerOpen ? displayMonth : visibleDate).format("MMMM YYYY")}
        </AppText>
        <Ionicons
          name={pickerOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.text}
        />
        {pickerOpen && (
          <Pressable onPress={handleNextMonth} style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={20} color={colors.tint} />
          </Pressable>
        )}
      </Pressable>
      <CalendarHeader />
      {pickerOpen && (
        <Calendar
          key={displayMonth}
          current={displayMonth}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={calendarTheme}
          firstDay={1}
          hideExtraDays={false}
          hideArrows
          renderHeader={() => null}
        />
      )}
      <CalendarBody
        showNowIndicator
        renderEvent={renderEvent}
        renderDraggableEvent={renderDraggableEvent}
        renderDraggingEvent={renderDraggingEvent}
      />
    </CalendarContainer>
  );
}

const styles = StyleSheet.create({
  datePickerToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 16,
    paddingLeft: 16,
    backgroundColor: colors.surface,
  },
  arrowButton: {
    padding: 4,
  },
});
