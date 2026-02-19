import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import type { DateData } from "react-native-calendars";
import { Calendar } from "react-native-calendars";

import { AppText } from "@/components/ux/AppText";
import { colors, fonts } from "@/theme";

const MONTH_RANGE = 24; // 2 years in each direction

type Props = {
  selectedDate: string;
  open: boolean;
  onToggle: () => void;
  onSelectDate: (date: string) => void;
};

type MonthItem = {
  key: string;
  date: string;
  label: string;
};

function buildMonths(): MonthItem[] {
  const items: MonthItem[] = [];
  const center = moment();
  for (let i = -MONTH_RANGE; i <= MONTH_RANGE; i++) {
    const m = center.clone().add(i, "months");
    items.push({
      key: m.format("YYYY-MM"),
      date: m.startOf("month").format("YYYY-MM-DD"),
      label: m.format("MMM"),
    });
  }
  return items;
}

const MONTHS = buildMonths();
const CENTER_INDEX = MONTH_RANGE;

export const ActivityDatePicker = memo(function ActivityDatePicker({
  selectedDate: rawSelectedDate,
  open,
  onToggle,
  onSelectDate,
}: Props) {
  const selectedDate = rawSelectedDate.slice(0, 10);
  const [displayMonth, setDisplayMonth] = useState(selectedDate);
  const monthListRef = useRef<FlatList>(null);

  // Sync displayMonth when picker opens or selectedDate changes externally
  useEffect(() => {
    if (open) setDisplayMonth(selectedDate);
  }, [open, selectedDate]);

  const markedDates = useMemo(() => {
    const marks: Record<
      string,
      {
        selected?: boolean;
      }
    > = {};
    marks[selectedDate] = {
      selected: true,
    };
    return marks;
  }, [selectedDate]);

  const calendarTheme = useMemo(
    () => ({
      calendarBackground: colors.background,
      dayTextColor: colors.text,
      monthTextColor: colors.text,
      textSectionTitleColor: colors.textSecondary,
      todayTextColor: colors.tint,
      selectedDayBackgroundColor: colors.tint,
      selectedDayTextColor: colors.background,
      arrowColor: colors.tint,
      textDayFontFamily: fonts.regular,
      textMonthFontFamily: fonts.semiBold,
      textDayHeaderFontFamily: fonts.medium,
    }),
    [],
  );

  const handleDayPress = useCallback(
    (day: DateData) => {
      onSelectDate(day.dateString);
    },
    [onSelectDate],
  );

  const handleMonthPress = useCallback((date: string) => {
    setDisplayMonth(date);
  }, []);

  const handleMonthChange = useCallback((date: DateData) => {
    setDisplayMonth(date.dateString);
  }, []);

  const activeMonthKey = moment(displayMonth).format("YYYY-MM");

  const renderMonthChip = useCallback(
    ({ item }: { item: MonthItem }) => {
      const isActive = item.key === activeMonthKey;
      return (
        <Pressable
          onPress={() => handleMonthPress(item.date)}
          style={[styles.monthChip, isActive && styles.monthChipActive]}
        >
          <AppText
            variant="caption"
            color={isActive ? colors.background : colors.text}
          >
            {item.label}
          </AppText>
        </Pressable>
      );
    },
    [activeMonthKey, handleMonthPress],
  );

  return (
    <View>
      <Pressable onPress={onToggle} style={styles.header}>
        <AppText variant="bodySemiBold" color={colors.text}>
          {moment(open ? displayMonth : selectedDate).format("MMMM YYYY")}
        </AppText>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.text}
        />
      </Pressable>

      {open && (
        <>
          <Calendar
            key={displayMonth}
            current={displayMonth}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={calendarTheme}
            firstDay={1}
            hideExtraDays={false}
            hideArrows
            enableSwipeMonths
            onMonthChange={handleMonthChange}
            renderHeader={() => null}
          />
          <FlatList
            ref={monthListRef}
            data={MONTHS}
            renderItem={renderMonthChip}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={CENTER_INDEX}
            getItemLayout={(_data, index) => ({
              length: CHIP_WIDTH + 8,
              offset: (CHIP_WIDTH + 8) * index,
              index,
            })}
            contentContainerStyle={styles.monthList}
          />
        </>
      )}
    </View>
  );
});

const CHIP_WIDTH = 52;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 16,
    paddingLeft: 16,
    backgroundColor: colors.surface,
  },
  monthList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthChip: {
    width: CHIP_WIDTH,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    marginHorizontal: 4,
  },
  monthChipActive: {
    backgroundColor: colors.tint,
    borderColor: colors.tint,
  },
});
