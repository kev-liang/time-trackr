import { memo } from "react";

import { ActivityTimelineEventEdit } from "@/components/ActivityTimelineEventEdit";
import { ActivityTimelineEventReadonly } from "@/components/ActivityTimelineEventReadonly";

type ActivityTimelineEventProps = {
  id?: string;
  title: string;
  start: string;
  end: string;
  color: string;
  height: number;
  textColor: string;
  secondaryTextColor: string;
  isEditing?: boolean;
  onPress?: (id: string) => void;
  onDragEnd?: (id: string, deltaStart: number, deltaEnd: number) => void;
};

export const ActivityTimelineEvent = memo(function ActivityTimelineEvent({
  isEditing = false,
  ...props
}: ActivityTimelineEventProps) {
  if (isEditing) {
    return <ActivityTimelineEventEdit {...props} />;
  }

  return <ActivityTimelineEventReadonly {...props} />;
});
