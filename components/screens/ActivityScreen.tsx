import { useEffect } from "react";
import { StyleSheet } from "react-native";

import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ThemedView } from "@/components/themed-view";
import { AppText } from "@/components/ux/AppText";
import { useActivityStore } from "@/stores/useActivityStore";
import { spacing } from "@/theme";

function todayISO() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export function ActivityScreen() {
  const addActivity = useActivityStore((s) => s.addActivity);
  const activities = useActivityStore((s) => s.activities);

  // Seed sample data once for demo purposes — remove later
  useEffect(() => {
    if (activities.length > 0) return;
    const today = todayISO();
    addActivity({
      id: "1",
      title: "Deep Work",
      start: `${today} 09:00`,
      end: `${today} 11:30`,
      color: "#4A90D9",
    });
    addActivity({
      id: "2",
      title: "Lunch Break",
      start: `${today} 12:00`,
      end: `${today} 13:00`,
      color: "#66BB6A",
    });
    addActivity({
      id: "3",
      title: "Meetings",
      start: `${today} 14:00`,
      end: `${today} 15:30`,
      color: "#FFA726",
    });
  }, []);

  return (
    <ThemedView style={styles.container}>
      <AppText variant="title" style={styles.heading}>
        Today
      </AppText>
      <ActivityTimeline date={todayISO()} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xxl,
  },
  heading: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
});
