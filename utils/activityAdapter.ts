import type { EventItem, OnEventResponse } from "@howljs/calendar-kit";

import type { Activity } from "@/stores/useActivityStore";
import { toLocalDateTimeString } from "@/utils/time";

/** Convert Activity[] to calendar-kit EventItem[].
 *  Activities are stored as UTC ISO strings; calendar-kit treats dateTime as
 *  local time, so we convert here. */
export function activitiesToEvents(activities: Activity[]): EventItem[] {
  return activities.map((a) => ({
    id: a.id,
    title: a.title,
    start: { dateTime: toLocalDateTimeString(new Date(a.start)) },
    end: { dateTime: toLocalDateTimeString(new Date(a.end)) },
    color: a.color,
  }));
}

/** Extract start/end ISO strings from an OnEventResponse after drag */
export function extractTimes(event: OnEventResponse): {
  start: string;
  end: string;
} {
  return {
    start: event.start.dateTime!,
    end: event.end.dateTime!,
  };
}
