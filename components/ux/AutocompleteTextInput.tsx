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

import { AutocompleteDropdown, CREATE_ID } from "@/components/ux/AutocompleteDropdown";
import { AppText } from "@/components/ux/AppText";
import { Chip } from "@/components/ux/Chip";
import { colors, fonts, spacing } from "@/theme";
import { ACTIVITY_COLORS } from "@/utils/consts";
import { fuzzyMatch } from "@/utils/fuzzyMatch";

const activityColorValues = Object.values(ACTIVITY_COLORS);

function randomActivityColor(): string {
  return activityColorValues[Math.floor(Math.random() * activityColorValues.length)];
}

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
  onCreate?: (label: string, color: string) => void;
  onEdit?: (item: AutocompleteItem) => void;
  onDelete?: (item: AutocompleteItem) => void;
  placeholder?: string;
  rightComponent?: ReactNode;
  TextInputComponent?: ComponentType<TextInputProps>;
  initialItem?: AutocompleteItem;
};

export function AutocompleteTextInput({
  items,
  value,
  onChangeText,
  onSelect,
  onCreate,
  onEdit,
  onDelete,
  placeholder,
  rightComponent,
  TextInputComponent = TextInput,
  initialItem,
}: AutocompleteTextInputProps) {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [selectedChips, setSelectedChips] = useState<AutocompleteItem[]>([]);
  const [stagedColor, setStagedColor] = useState<string | null>(null);

  useEffect(() => {
    setLocalValue(value);
    if (!value) setStagedColor(null);
  }, [value]);

  useEffect(() => {
    if (initialItem) {
      setSelectedChips([initialItem]);
      setLocalValue("");
    } else {
      setSelectedChips([]);
    }
  }, [initialItem]);

  const filtered = useMemo(() => {
    const selectedIds = new Set(selectedChips.map((c) => c.id));
    const selectedLabels = new Set(selectedChips.map((c) => c.label.toLowerCase()));
    const base = localValue
      ? items.filter((item) => fuzzyMatch(localValue, item.label))
      : items;
    return base.filter(
      (item) => !selectedIds.has(item.id) && !selectedLabels.has(item.label.toLowerCase()),
    );
  }, [localValue, items, selectedChips]);

  const listData = useMemo(() => {
    const trimmed = localValue.trim();
    if (!trimmed) return filtered;
    return [...filtered, { id: CREATE_ID, label: trimmed, color: stagedColor ?? randomActivityColor() }];
  }, [filtered, localValue, stagedColor]);

  const handleSelect = useCallback(
    (item: AutocompleteItem) => {
      const isNew = item.id === CREATE_ID;
      const color = isNew ? (stagedColor ?? randomActivityColor()) : item.color;
      const chip = isNew
        ? { ...item, id: `created:${item.label}`, color }
        : item;
      if (isNew) onCreate?.(item.label, color!);
      setSelectedChips((prev) => [...prev, chip]);
      onSelect(chip);
      onChangeText("");
      setLocalValue("");
      setStagedColor(null);
      setOpen(false);
    },
    [onSelect, onCreate, onChangeText, stagedColor],
  );

  const handleSubmitEditing = useCallback(() => {
    const trimmed = localValue.trim();
    if (!trimmed) return;
    const exact = items.find(
      (i) => i.label.toLowerCase() === trimmed.toLowerCase(),
    );
    handleSelect(exact ?? { id: CREATE_ID, label: trimmed });
  }, [localValue, items, handleSelect]);

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
      if (text && !localValue) setStagedColor(randomActivityColor());
      else if (!text) setStagedColor(null);
      setLocalValue(text);
      setOpen(true);
      onChangeText(text);
    },
    [onChangeText, localValue],
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
            <Chip
              key={chip.id}
              label={chip.label}
              color={chip.color ?? colors.tint}
              onPress={() => handleRemoveChip(chip.id)}
              rightComponent={
                <AppText variant="body" color="rgba(255,255,255,0.75)">
                  {" ×"}
                </AppText>
              }
            />
          ))}
          <TextInputComponent
            style={styles.textInput}
            value={localValue}
            onChangeText={onChangeTextLocal}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleSubmitEditing}
            submitBehavior="submit"
            placeholder={selectedChips.length === 0 ? placeholder : undefined}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        {rightComponent}
      </View>
      {open && (
        <AutocompleteDropdown data={listData} onSelect={handleSelect} onEdit={onEdit} onDelete={onDelete} />
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
