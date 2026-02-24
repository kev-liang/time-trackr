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
import { useCallback, useMemo, useRef, useState } from "react";
import type { GestureResponderEvent } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import { ActivityDatePicker } from "@/components/activities/ActivityDatePicker";
import { ActivityTimelineEvent } from "@/components/activities/ActivityTimelineEvent";
import { useActivityTimeline } from "@/hooks/useActivityTimeline";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { colors } from "@/theme";
import { extractTimes } from "@/utils/activityAdapter";
import { MS_PER_MINUTE } from "@/utils/activityTime";

export function ActivityTimeline() {
  const calendarRef = useRef<CalendarKitHandle>(null);
  const { events, today, theme, unavailableHours } = useActivityTimeline();
  const [selectedDate, setSelectedDate] = useState(today);
  const [pickerOpen, setPickerOpen] = useState(false);

  const editingEventId = useActivityEditStore((s) => s.editingEventId);
  const hasDraft = useActivityEditStore((s) => s.hasDraft);
  const defaultStart = useActivityEditStore((s) => s.defaultStart);
  const defaultEnd = useActivityEditStore((s) => s.defaultEnd);

  const existingSelectedEvent: SelectedEventType | undefined = useMemo(() => {
    if (!editingEventId) return undefined;
    const found = events.find((e) => e.id === editingEventId);
    if (!found) return undefined;
    return found as SelectedEventType;
  }, [editingEventId, events]);

  const draftSelectedEvent: SelectedEventType | undefined = useMemo(() => {
    if (!hasDraft || editingEventId || !defaultStart || !defaultEnd)
      return undefined;
    return {
      title: "",
      start: { dateTime: defaultStart.toISOString() },
      end: { dateTime: defaultEnd.toISOString() },
      color: colors.tint,
    };
  }, [hasDraft, editingEventId, defaultStart, defaultEnd]);

  const selectedEvent = existingSelectedEvent ?? draftSelectedEvent;

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
      const start = new Date(dateTime);
      const end = new Date(start.getTime() + 60 * MS_PER_MINUTE);
      useActivityEditStore.getState().openCreate(start, end);
    },
    [],
  );

  const handleDragEventEnd = useCallback(async (event: OnEventResponse) => {
    const { start, end } = extractTimes(event);
    await useActivityStore.getState().updateActivity(event.id, { start, end });
  }, []);

  const handleDragSelectedEventEnd = useCallback(
    async (event: SelectedEventType) => {
      if (!event.id) {
        // Draft ghost was resized — sync times back to the store
        const start = event.start.dateTime;
        const end = event.end.dateTime;
        if (!start || !end) return;
        useActivityEditStore
          .getState()
          .updateDraft(new Date(start), new Date(end));
        return;
      }
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
      <ActivityTimelineEvent
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
        <ActivityTimelineEvent
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

  const handleDateChanged = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleSelectDate = useCallback((date: string) => {
    setPickerOpen(false);
    setSelectedDate(date);
    calendarRef.current?.goToDate({ date });
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
      <ActivityDatePicker
        selectedDate={selectedDate}
        open={pickerOpen}
        onToggle={() => setPickerOpen((prev) => !prev)}
        onSelectDate={handleSelectDate}
      />
      <CalendarHeader />
      <CalendarBody
        showNowIndicator
        renderEvent={renderEvent}
        renderDraggableEvent={renderDraggableEvent}
        renderDraggingEvent={renderDraggingEvent}
      />
    </CalendarContainer>
  );
}
