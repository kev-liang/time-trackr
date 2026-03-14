import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme";

type GridLine = { mins: number; yPx: number; label: string };

function getGridInterval(maxMinutes: number): number {
  if (maxMinutes <= 15) return 5;
  if (maxMinutes <= 30) return 10;
  if (maxMinutes <= 60) return 15;
  if (maxMinutes <= 120) return 30;
  if (maxMinutes <= 240) return 60;
  if (maxMinutes <= 480) return 120;
  if (maxMinutes <= 960) return 240;
  return 480;
}

function formatGridLabel(minutes: number): string {
  return minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`;
}

export function buildGridLines(maxMinutes: number, barMaxHeight: number): GridLine[] {
  if (maxMinutes <= 0) return [];
  const interval = getGridInterval(maxMinutes);
  return Array.from({ length: Math.floor(maxMinutes / interval) }, (_, i) => {
    const mins = interval * (i + 1);
    return { mins, yPx: (mins / maxMinutes) * barMaxHeight, label: formatGridLabel(mins) };
  });
}

type YAxisProps = {
  gridLines: GridLine[];
  height: number;
  width: number;
};

export function WeeklyYAxis({ gridLines, height, width }: YAxisProps) {
  return (
    <View style={[styles.yAxis, { height, width }]}>
      {gridLines.map((line) => (
        <Text key={line.mins} style={[styles.yLabel, { width, bottom: line.yPx - 6 }]}>
          {line.label}
        </Text>
      ))}
    </View>
  );
}

type GridLinesProps = {
  gridLines: GridLine[];
};

export function WeeklyGridLines({ gridLines }: GridLinesProps) {
  return (
    <>
      {gridLines.map((line) => (
        <View key={line.mins} style={[styles.gridLine, { bottom: line.yPx }]} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  yAxis: {
    position: "relative",
  },
  yLabel: {
    position: "absolute",
    right: 4,
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: "right",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
});
