import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { AppText } from "@/components/ux/AppText";
import { colors, fonts, spacing } from "@/theme";
import { fuzzyMatch } from "@/utils/fuzzyMatch";

export type AutocompleteItem = {
  id: string;
  label: string;
  color?: string;
};

const CREATE_ID = "__create__";

type AutocompleteTextInputProps = {
  items: AutocompleteItem[];
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (item: AutocompleteItem) => void;
  placeholder?: string;
  rightComponent?: ReactNode;
  TextInputComponent?: ComponentType<TextInputProps>;
};

export function AutocompleteTextInput({
  items,
  value,
  onChangeText,
  onSelect,
  placeholder,
  rightComponent,
  TextInputComponent = TextInput,
}: AutocompleteTextInputProps) {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [selectedChip, setSelectedChip] = useState<AutocompleteItem | null>(
    null,
  );
  const chipInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!selectedChip) {
      setLocalValue(value);
    }
    if (!value) {
      setSelectedChip(null);
    }
  }, [value, selectedChip]);

  const filtered = useMemo(() => {
    if (!localValue) return items;
    return items.filter((item) => fuzzyMatch(localValue, item.label));
  }, [localValue, items]);

  const listData = useMemo(() => {
    const trimmed = localValue.trim();
    if (!trimmed) return filtered;
    return [...filtered, { id: CREATE_ID, label: trimmed }];
  }, [filtered, localValue]);

  const handleSelect = useCallback(
    (item: AutocompleteItem) => {
      setSelectedChip(item);
      onSelect(item);
      onChangeText(item.label);
      setLocalValue("");
      setOpen(false);
      setTimeout(() => chipInputRef.current?.focus(), 50);
    },
    [onSelect, onChangeText],
  );

  const handleClearChip = useCallback(() => {
    setSelectedChip(null);
    onChangeText("");
    setLocalValue("");
    setOpen(false);
  }, [onChangeText]);

  const handleChipKeyPress = useCallback(
    (e: { nativeEvent: { key: string } }) => {
      if (e.nativeEvent.key === "Backspace") {
        handleClearChip();
      }
    },
    [handleClearChip],
  );

  const handleFocus = useCallback(() => setOpen(true), []);

  const handleBlur = useCallback(() => {
    setTimeout(() => setOpen(false), 150);
  }, []);

  const onChangeTextLocal = useCallback(
    (text: string) => {
      setLocalValue(text);
      setOpen(true);
      onChangeText(text);
    },
    [onChangeText],
  );

  const chipColor = selectedChip?.color ?? colors.tint;

  return (
    <View>
      <View style={styles.inputRow}>
        {selectedChip ? (
          <>
            <View
              style={[
                styles.chipWrapper,
                rightComponent ? styles.chipWrapperWithRight : undefined,
              ]}
            >
              <Pressable
                style={[styles.chip, { backgroundColor: chipColor }]}
                onPress={handleClearChip}
                hitSlop={4}
              >
                <AppText variant="body" color="#fff">
                  {selectedChip.label}
                </AppText>
                <AppText variant="body" color="rgba(255,255,255,0.75)">
                  {" ×"}
                </AppText>
              </Pressable>
              <TextInput
                ref={chipInputRef}
                style={styles.chipCursor}
                value=""
                onChangeText={() => {}}
                onKeyPress={handleChipKeyPress}
                caretHidden={false}
              />
            </View>
            {rightComponent}
          </>
        ) : (
          <>
            <TextInputComponent
              style={[
                styles.input,
                rightComponent ? styles.inputWithRight : undefined,
              ]}
              value={localValue}
              onChangeText={onChangeTextLocal}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              placeholderTextColor={colors.textSecondary}
            />
            {rightComponent}
          </>
        )}
      </View>
      {open && !selectedChip && (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          style={styles.dropdown}
          ListHeaderComponent={DropdownHeader}
          ItemSeparatorComponent={Separator}
          renderItem={({ item }) =>
            item.id === CREATE_ID ? (
              <Pressable
                style={({ pressed }) => [
                  styles.row,
                  styles.createRow,
                  pressed && styles.rowPressed,
                ]}
                onPress={() => handleSelect(item)}
              >
                <AppText variant="body" color={colors.tint}>
                  Create{" "}
                </AppText>
                <AppText variant="bodySemiBold" color={colors.tint}>
                  {item.label}
                </AppText>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.row,
                  pressed && styles.rowPressed,
                ]}
                onPress={() => handleSelect(item)}
              >
                <AppText variant="body">{item.label}</AppText>
              </Pressable>
            )
          }
        />
      )}
    </View>
  );
}

function DropdownHeader() {
  return (
    <View style={styles.dropdownHeader}>
      <AppText variant="body" color={colors.textSecondary}>
        Select an activity or create a new one
      </AppText>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
  },
  inputWithRight: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  chipWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    gap: spacing.xs,
  },
  chipWrapperWithRight: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chipCursor: {
    flex: 1,
    minWidth: 4,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  dropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors.background,
  },
  row: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dropdownHeader: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  createRow: {
    flexDirection: "row",
  },
});
