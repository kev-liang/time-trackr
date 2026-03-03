import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { AppText } from "@/components/ux/AppText";
import { colors } from "@/theme";

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const LOOP_COUNT = 3;

type SpinnerColumnProps = {
  items: string[];
  initialIndex: number;
  onChange: (index: number) => void;
  width: number;
  loop?: boolean;
};

function SpinnerColumn({
  items,
  initialIndex,
  onChange,
  width,
  loop = true,
}: SpinnerColumnProps) {
  const scrollRef = useRef<ScrollView>(null);

  const loopedItems = loop
    ? Array.from({ length: LOOP_COUNT }, () => items).flat()
    : items;
  const startLoopIndex = loop
    ? Math.floor(LOOP_COUNT / 2) * items.length + initialIndex
    : initialIndex;

  const [selectedLoopIndex, setSelectedLoopIndex] = useState(startLoopIndex);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: startLoopIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 50);
    return () => clearTimeout(t);
  }, []);

  const handleScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const rawIndex = Math.max(
        0,
        Math.min(
          Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT),
          loopedItems.length - 1,
        ),
      );
      const actualIndex = loop ? rawIndex % items.length : rawIndex;
      setSelectedLoopIndex(rawIndex);
      onChange(actualIndex);
    },
    [loop, items.length, loopedItems.length, onChange],
  );

  return (
    <View style={[styles.column, { width }]}>
      <View style={styles.highlight} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={styles.columnContent}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        scrollEventThrottle={16}
      >
        {loopedItems.map((item, i) => (
          <View key={i} style={styles.item}>
            <AppText
              variant={selectedLoopIndex === i ? "bodySemiBold" : "body"}
              color={
                selectedLoopIndex === i ? colors.text : colors.textSecondary
              }
            >
              {item}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export type TimeSpinnerPickerProps = {
  value: Date;
  minuteInterval?: number;
  onChange: (date: Date) => void;
};

export function TimeSpinnerPicker({
  value,
  minuteInterval = 5,
  onChange,
}: TimeSpinnerPickerProps) {
  const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const MINUTES = Array.from(
    { length: Math.floor(60 / minuteInterval) },
    (_, i) => String(i * minuteInterval).padStart(2, "0"),
  );
  const PERIODS = ["AM", "PM"];

  const rawHour = value.getHours();
  const initHourIndex = (rawHour % 12 === 0 ? 12 : rawHour % 12) - 1;
  const initMinuteIndex = Math.min(
    Math.round(value.getMinutes() / minuteInterval),
    MINUTES.length - 1,
  );
  const initPeriodIndex = rawHour < 12 ? 0 : 1;

  const hourIndexRef = useRef(initHourIndex);
  const minuteIndexRef = useRef(initMinuteIndex);
  const periodIndexRef = useRef(initPeriodIndex);
  const currentDateRef = useRef(value);

  const buildDate = useCallback(
    (hIdx: number, mIdx: number, pIdx: number): Date => {
      const hour12 = hIdx + 1;
      const hour24 =
        pIdx === 0
          ? hour12 === 12
            ? 0
            : hour12
          : hour12 === 12
            ? 12
            : hour12 + 12;
      const d = new Date(currentDateRef.current);
      d.setHours(hour24, mIdx * minuteInterval, 0, 0);
      return d;
    },
    [minuteInterval],
  );

  const handleHourChange = useCallback(
    (i: number) => {
      hourIndexRef.current = i;
      const d = buildDate(i, minuteIndexRef.current, periodIndexRef.current);
      currentDateRef.current = d;
      onChange(d);
    },
    [buildDate, onChange],
  );

  const handleMinuteChange = useCallback(
    (i: number) => {
      minuteIndexRef.current = i;
      const d = buildDate(hourIndexRef.current, i, periodIndexRef.current);
      currentDateRef.current = d;
      onChange(d);
    },
    [buildDate, onChange],
  );

  const handlePeriodChange = useCallback(
    (i: number) => {
      periodIndexRef.current = i;
      const d = buildDate(hourIndexRef.current, minuteIndexRef.current, i);
      currentDateRef.current = d;
      onChange(d);
    },
    [buildDate, onChange],
  );

  return (
    <View style={styles.container}>
      <SpinnerColumn
        items={HOURS}
        initialIndex={initHourIndex}
        onChange={handleHourChange}
        width={56}
      />
      <AppText variant="bodySemiBold" style={styles.colon}>
        :
      </AppText>
      <SpinnerColumn
        items={MINUTES}
        initialIndex={initMinuteIndex}
        onChange={handleMinuteChange}
        width={56}
      />
      <SpinnerColumn
        items={PERIODS}
        initialIndex={initPeriodIndex}
        onChange={handlePeriodChange}
        width={64}
        loop={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: PICKER_HEIGHT,
    backgroundColor: colors.background,
  },
  column: {
    height: PICKER_HEIGHT,
    overflow: "hidden",
  },
  columnContent: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  highlight: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  colon: {
    paddingHorizontal: 4,
  },
});
