import { type ComponentType, type ReactNode, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, type TextInputProps, View } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { colors, fonts, spacing } from "@/theme";
import { fuzzyMatch } from "@/utils/fuzzyMatch";

export type AutocompleteItem = {
  id: string;
  label: string;
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

  const filtered = useMemo(() => {
    if (!value) return items;
    return items.filter((item) => fuzzyMatch(value, item.label));
  }, [value, items]);

  const handleSelect = useCallback(
    (item: AutocompleteItem) => {
      onSelect(item);
      onChangeText(item.label);
      setOpen(false);
    },
    [onSelect, onChangeText],
  );

  const handleFocus = useCallback(() => setOpen(true), []);

  const handleBlur = useCallback(() => {
    // Small delay so onPress on items fires before blur hides the list
    setTimeout(() => setOpen(false), 150);
  }, []);

  const onChangeTextLocal = useCallback((text: string) => {
    setOpen(true);
    onChangeText(text);
  }, []);

  return (
    <View>
      <View style={styles.inputRow}>
        <TextInputComponent
          style={[
            styles.input,
            rightComponent ? styles.inputWithRight : undefined,
          ]}
          value={value}
          onChangeText={onChangeTextLocal}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
        />
        {rightComponent}
      </View>
      {open && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          style={styles.dropdown}
          ItemSeparatorComponent={Separator}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                pressed && styles.rowPressed,
              ]}
              onPress={() => handleSelect(item)}
            >
              <AppText variant="body">{item.label}</AppText>
            </Pressable>
          )}
        />
      )}
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
});
