import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { AutocompleteChip } from "@/components/ux/AutocompleteChip";
import { AutocompleteDropdown, CREATE_ID } from "@/components/ux/AutocompleteDropdown";
import { colors, fonts, spacing } from "@/theme";
import { fuzzyMatch } from "@/utils/fuzzyMatch";

export type AutocompleteItem = {
  id: string;
  label: string;
  color?: string;
};

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
  const [selectedChips, setSelectedChips] = useState<AutocompleteItem[]>([]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const filtered = useMemo(() => {
    const selectedIds = new Set(selectedChips.map((c) => c.id));
    const base = localValue
      ? items.filter((item) => fuzzyMatch(localValue, item.label))
      : items;
    return base.filter((item) => !selectedIds.has(item.id));
  }, [localValue, items, selectedChips]);

  const listData = useMemo(() => {
    const trimmed = localValue.trim();
    if (!trimmed) return filtered;
    return [...filtered, { id: CREATE_ID, label: trimmed }];
  }, [filtered, localValue]);

  const handleSelect = useCallback(
    (item: AutocompleteItem) => {
      const chip =
        item.id === CREATE_ID ? { ...item, id: `created:${item.label}` } : item;
      setSelectedChips((prev) => [...prev, chip]);
      onSelect(chip);
      onChangeText("");
      setLocalValue("");
      setOpen(false);
    },
    [onSelect, onChangeText],
  );

  const handleRemoveChip = useCallback((id: string) => {
    setSelectedChips((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleKeyPress = useCallback(
    (e: { nativeEvent: { key: string } }) => {
      if (e.nativeEvent.key === "Backspace" && !localValue && selectedChips.length > 0) {
        setSelectedChips((prev) => prev.slice(0, -1));
      }
    },
    [localValue, selectedChips.length],
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

  return (
    <View>
      <View style={styles.row}>
        <View
          style={[
            styles.inputContainer,
            rightComponent ? styles.inputContainerWithRight : undefined,
          ]}
        >
          {selectedChips.map((chip) => (
            <AutocompleteChip
              key={chip.id}
              item={chip}
              onRemove={() => handleRemoveChip(chip.id)}
            />
          ))}
          <TextInputComponent
            style={styles.textInput}
            value={localValue}
            onChangeText={onChangeTextLocal}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            placeholder={selectedChips.length === 0 ? placeholder : undefined}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        {rightComponent}
      </View>
      {open && (
        <AutocompleteDropdown data={listData} onSelect={handleSelect} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
  },
  inputContainerWithRight: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  textInput: {
    flex: 1,
    minWidth: 80,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
});
