import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Timeline } from 'react-native-calendars';

import { useActivityStore } from '@/stores/useActivityStore';
import { colors } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ActivityTimelineProps = {
  date: string; // "YYYY-MM-DD"
};

export function ActivityTimeline({ date }: ActivityTimelineProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colors[colorScheme];
  const activities = useActivityStore((s) => s.activities);

  const events = useMemo(
    () =>
      activities
        .filter((a) => a.start.startsWith(date))
        .map((a) => ({
          id: a.id,
          start: a.start,
          end: a.end,
          title: a.title,
          color: a.color,
        })),
    [activities, date]
  );

  return (
    <View style={styles.container}>
      <Timeline
        date={date}
        events={events}
        start={6}
        end={23}
        format24h
        scrollToNow
        showNowIndicator
        overlapEventsSpacing={4}
        theme={{
          calendarBackground: theme.background,
          timeLabel: { color: theme.textSecondary },
          nowIndicatorLine: { backgroundColor: theme.tint },
          nowIndicatorKnob: { backgroundColor: theme.tint },
          event: {
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
