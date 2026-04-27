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
  type RenderHourProps,
  type SelectedEventType,
  type SizeAnimation,
} from "@howljs/calendar-kit";
import moment from "moment";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { GestureResponderEvent } from "react-native";
import { Text, View, useWindowDimensions } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActivityDatePicker } from "@/components/activities/ActivityDatePicker";
import { ActivityTimelineEvent } from "@/components/activities/ActivityTimelineEvent";
import { useActivityTimeline } from "@/hooks/useActivityTimeline";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { colors } from "@/theme";
import { MS_PER_MINUTE } from "@/utils/activityTime";
import { toLocalDateTimeString } from "@/utils/time";

export type ActivityTimelineHandle = {
  goToToday: () => void;
  getSizeByDuration: (minutes: number) => { height: number } | undefined;
  zoom: (props: { scale: number }) => void;
};

type Props = {
  sheetTopY?: number | null;
  onDateChanged?: (date: string) => void;
  onLoad?: () => void;
};

export const ActivityTimeline = forwardRef<ActivityTimelineHandle, Props>(
  function ActivityTimeline({ sheetTopY, onDateChanged, onLoad }, ref) {
    const calendarRef = useRef<CalendarKitHandle>(null);
    const { top: safeAreaTop } = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();
    const [calendarHeaderHeight, setCalendarHeaderHeight] = useState(0);
    const { events, today, theme } = useActivityTimeline();
    const [selectedDate, setSelectedDate] = useState(today);
    const isPro = useSubscriptionStore((s) => s.isPro);

    useImperativeHandle(ref, () => ({
      goToToday: () => {
        const todayStr = moment().local().format("YYYY-MM-DD");
        calendarRef.current?.goToDate({ date: todayStr, animatedDate: true });
        setSelectedDate(todayStr);
        const now = moment().local();
        const hour = now.hours() + now.minutes() / 60;
        calendarRef.current?.goToHour(Math.max(0, hour), true);
      },
      getSizeByDuration: (minutes: number) =>
        calendarRef.current?.getSizeByDuration(minutes),
      zoom: (props: { scale: number }) => calendarRef.current?.zoom(props),
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
    }, [
      hasDraft,
      editingEventId,
      previewStart,
      previewEnd,
      draftStart,
      draftEnd,
      draftColor,
      draftTitle,
    ]);

    const selectedEvent = existingSelectedEvent ?? draftSelectedEvent;

    // TODO: small bug when scrolling to end of day, hitting + FAB makes calendar scroll up then back down
    useEffect(() => {
      if (sheetTopY == null) return;

      let start: Date | undefined;
      if (hasDraft) {
        start = useActivityEditStore.getState().draftStart ?? undefined;
      } else if (editingEventId) {
        const dt = events.find((e) => e.id === editingEventId)?.start.dateTime;
        start = dt ? new Date(dt) : undefined;
      }
      if (!start) return;

      const hour = start.getHours() + start.getMinutes() / 60;
      const hourHeight =
        calendarRef.current?.getSizeByDuration(60)?.height ?? 60;
      const calendarBodyTop = safeAreaTop + calendarHeaderHeight;
      const ghostFromCalendarTop = Math.max(0, sheetTopY - calendarBodyTop);
      const hourOffset = ghostFromCalendarTop / hourHeight;
      calendarRef.current?.goToHour(Math.max(0, hour - hourOffset), true);
    }, [
      hasDraft,
      editingEventId,
      sheetTopY,
      safeAreaTop,
      calendarHeaderHeight,
      events,
    ]);

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
      // If this is the selected/editing event, onDragSelectedEventEnd handles it
      // to avoid a race condition between two concurrent updateActivity calls.
      if (event.id === useActivityEditStore.getState().editingEventId) return;
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
        useActivityStore.getState().updateActivity(event.id, {
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
          end={event.end.dateTime!}
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
            end={event.end.dateTime!}
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

    const renderDraggingHour = useCallback((props: RenderHourProps) => {
      const totalHours = Math.floor(props.minutes / 60);
      const h = totalHours % 12 || 12;
      const m = Math.floor(props.minutes % 60)
        .toString()
        .padStart(2, "0");
      const ampm = totalHours >= 12 ? "PM" : "AM";
      return <Text style={props.style}>{`${h}:${m} ${ampm}`}</Text>;
    }, []);

    const handleDateChanged = useCallback(
      (date: string) => {
        setSelectedDate(date);
        onDateChanged?.(date);
      },
      [onDateChanged],
    );

    const handleSelectDate = useCallback((date: string) => {
      setPickerOpen(false);
      setSelectedDate(date);
      calendarRef.current?.goToDate({ date });
    }, []);

    const spaceFromBottom =
      sheetTopY != null && !isPro ? 150 : sheetTopY != null && isPro ? 120 : 0;

    return (
      <CalendarContainer
        ref={calendarRef}
        numberOfDays={1}
        spaceFromBottom={spaceFromBottom}
        events={events}
        initialDate={today}
        scrollToNow
        theme={theme}
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
        onLoad={onLoad}
        overlapEventsSpacing={8}
        rightEdgeSpacing={0}
        start={0}
        end={1440}
        allowPinchToZoom
        minTimeIntervalHeight={40}
        maxTimeIntervalHeight={200}
      >
        <View
          onLayout={(e) => setCalendarHeaderHeight(e.nativeEvent.layout.height)}
        >
          <ActivityDatePicker
            selectedDate={selectedDate}
            open={pickerOpen}
            onToggle={() => setPickerOpen((prev) => !prev)}
            onSelectDate={handleSelectDate}
          />
          <CalendarHeader />
        </View>
        <CalendarBody
          showNowIndicator
          hourFormat="h A"
          renderEvent={renderEvent}
          renderDraggableEvent={renderDraggableEvent}
          renderDraggingEvent={renderDraggingEvent}
          renderDraggingHour={renderDraggingHour}
        />
      </CalendarContainer>
    );
  },
);
