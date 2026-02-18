import { memo } from "react";

import { ActivityTimelineEventEdit } from "@/components/ActivityTimelineEventEdit";
import { ActivityTimelineEventReadonly } from "@/components/ActivityTimelineEventReadonly";
import { useActivityEditStore } from "@/stores/useActivityEditStore";

type ActivityTimelineEventProps = {
  id?: string;
  title: string;
  start: string;
  end: string;
  color: string;
  height: number;
  textColor: string;
  secondaryTextColor: string;
};

export const ActivityTimelineEvent = memo(function ActivityTimelineEvent(
  props: ActivityTimelineEventProps,
) {
  const editingEventId = useActivityEditStore((s) => s.editingEventId);
  const isEditing = props.id === editingEventId;

  if (isEditing) {
    return <ActivityTimelineEventEdit {...props} />;
  }

  return <ActivityTimelineEventReadonly {...props} />;
});
