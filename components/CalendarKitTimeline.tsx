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
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { useCallback, useMemo, useRef, useState } from "react";
import type { GestureResponderEvent } from "react-native";
import { Pressable, StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";

import { CalendarKitEvent } from "@/components/CalendarKitEvent";
import { AppText } from "@/components/ux/AppText";
import { useCalendarKit } from "@/hooks/useCalendarKit";
import { useActivityEditStore } from "@/stores/useActivityEditStore";
import { useActivityStore } from "@/stores/useActivityStore";
import { colors } from "@/theme";
import { MS_PER_MINUTE } from "@/utils/activityTime";
import { extractTimes } from "@/utils/calendarKitAdapter";

export function CalendarKitTimeline() {
  const calendarRef = useRef<CalendarKitHandle>(null);
  const { events, today, theme, unavailableHours } = useCalendarKit();
  const [visibleDate, setVisibleDate] = useState(today);
  const [pickerOpen, setPickerOpen] = useState(false);

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

  const handleDateChanged = useCallback((date: string) => {
    setVisibleDate(date);
  }, []);

  const handlePickerChange = useCallback((_event: unknown, selected?: Date) => {
    if (!selected) return;
    const iso = moment(selected).format("YYYY-MM-DD");
    setPickerOpen(false);
    calendarRef.current?.goToDate({ date: iso });
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
        onPress={() => setPickerOpen((prev) => !prev)}
        style={styles.datePickerToggle}
      >
        <AppText variant="bodySemiBold" color={colors.text}>
          {moment(visibleDate).format("MMMM YYYY")}
        </AppText>
        <Ionicons
          name={pickerOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.text}
        />
      </Pressable>
      <CalendarHeader />
      {pickerOpen && (
        <DateTimePicker
          mode="date"
          display="inline"
          value={new Date(visibleDate)}
          onChange={handlePickerChange}
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
});
