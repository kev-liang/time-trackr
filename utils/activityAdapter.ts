import type { EventItem, OnEventResponse } from "@howljs/calendar-kit";

import type { Activity } from "@/stores/useActivityStore";

/** Convert Activity[] to calendar-kit EventItem[] */
export function activitiesToEvents(activities: Activity[]): EventItem[] {
  return activities.map((a) => ({
    id: a.id,
    title: a.title,
    start: { dateTime: a.start },
    end: { dateTime: a.end },
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
