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
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { GestureResponderEvent } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import { ActivityDatePicker } from "@/components/activities/ActivityDatePicker";
import { ActivityTimelineEvent } from "@/components/activities/ActivityTimelineEvent";
import { useActivityTimeline } from "@/hooks/useActivityTimeline";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { colors } from "@/theme";
import { MS_PER_MINUTE } from "@/utils/activityTime";
import { toLocalDateTimeString } from "@/utils/time";

export type ActivityTimelineHandle = {
  goToToday: () => void;
};

type Props = {
  sheetSnapHeight?: number;
  onDateChanged?: (date: string) => void;
};

export const ActivityTimeline = forwardRef<ActivityTimelineHandle, Props>(
function ActivityTimeline({ sheetSnapHeight = 0, onDateChanged }, ref) {
  const calendarRef = useRef<CalendarKitHandle>(null);
  const { events, today, theme, unavailableHours } = useActivityTimeline();
  const [selectedDate, setSelectedDate] = useState(today);

  useImperativeHandle(ref, () => ({
    goToToday: () => {
      const todayStr = new Date().toISOString().split("T")[0];
      calendarRef.current?.goToDate({ date: todayStr, animatedDate: true });
      setSelectedDate(todayStr);
      const now = new Date();
      const hour = now.getHours() + now.getMinutes() / 60;
      calendarRef.current?.goToHour(Math.max(0, hour), true);
    },
  }));
  const [pickerOpen, setPickerOpen] = useState(false);

  const editingEventId = useActivityEditStore((s) => s.editingEventId);
  const hasDraft = useActivityEditStore((s) => s.hasDraft);
  const draftStart = useActivityEditStore((s) => s.draftStart);
  const draftEnd = useActivityEditStore((s) => s.draftEnd);
  const previewStart = useActivityEditStore((s) => s.previewStart);
  const previewEnd = useActivityEditStore((s) => s.previewEnd);
  const draftColor = useActivityEditStore((s) => s.draftColor);
  const draftTitle = useActivityEditStore((s) => s.draftTitle);

  const existingSelectedEvent: SelectedEventType | undefined = useMemo(() => {
    if (!editingEventId) return undefined;
    const found = events.find((e) => e.id === editingEventId);
    if (!found) return undefined;
    if (previewStart && previewEnd) {
      return {
        ...found,
        start: { dateTime: toLocalDateTimeString(previewStart) },
        end: { dateTime: toLocalDateTimeString(previewEnd) },
      } as SelectedEventType;
    }
    return found as SelectedEventType;
  }, [editingEventId, events, previewStart, previewEnd]);

  const draftSelectedEvent: SelectedEventType | undefined = useMemo(() => {
    if (!hasDraft || editingEventId) return undefined;
    const start = previewStart ?? draftStart;
    const end = previewEnd ?? draftEnd;
    if (!start || !end) return undefined;
    return {
      title: draftTitle,
      start: { dateTime: toLocalDateTimeString(start) },
      end: { dateTime: toLocalDateTimeString(end) },
      color: draftColor,
    };
  }, [hasDraft, editingEventId, previewStart, previewEnd, draftStart, draftEnd, draftColor, draftTitle]);

  const selectedEvent = existingSelectedEvent ?? draftSelectedEvent;

  // TODO: small bug when scrolling to end of day, hitting + FAB makes calendar scroll up then back down
  useEffect(() => {
    if (!hasDraft) return;
    const { draftStart } = useActivityEditStore.getState();
    if (!draftStart) return;
    const hour = draftStart.getHours() + draftStart.getMinutes() / 60;
    const hourHeight = calendarRef.current?.getSizeByDuration(60)?.height ?? 60;
    const hourOffset = sheetSnapHeight / hourHeight;
    calendarRef.current?.goToHour(Math.max(0, hour - hourOffset), true);
  }, [hasDraft, sheetSnapHeight]);

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
    await useActivityStore.getState().updateActivity(event.id, {
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    });
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
      useActivityEditStore.getState().clearPreview();
      await useActivityStore.getState().updateActivity(event.id, {
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      });
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
    onDateChanged?.(date);
  }, [onDateChanged]);

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
});
