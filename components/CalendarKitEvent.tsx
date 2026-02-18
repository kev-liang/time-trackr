import { memo } from "react";

import { CalendarKitEventEdit } from "@/components/CalendarKitEventEdit";
import { CalendarKitEventReadonly } from "@/components/CalendarKitEventReadonly";
import { useActivityEditStore } from "@/stores/useActivityEditStore";

type CalendarKitEventProps = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
};

export const CalendarKitEvent = memo(function CalendarKitEvent(
  props: CalendarKitEventProps,
) {
  const editingEventId = useActivityEditStore((s) => s.editingEventId);
  const isEditing = props.id === editingEventId;

  if (isEditing) {
    return <CalendarKitEventEdit {...props} />;
  }

  return <CalendarKitEventReadonly {...props} />;
});
