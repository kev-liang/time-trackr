import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { Chip } from "@/components/ux/Chip";
import { colors, spacing } from "@/theme";

export const CREATE_ID = "__create__";

type DropdownItem = {
  id: string;
  label: string;
  color?: string;
};

type AutocompleteDropdownProps = {
  data: DropdownItem[];
  onSelect: (item: DropdownItem) => void;
};

export function AutocompleteDropdown({
  data,
  onSelect,
}: AutocompleteDropdownProps) {
  return (
    <BottomSheetFlatList<DropdownItem>
      data={data}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      style={styles.dropdown}
      ListHeaderComponent={DropdownHeader}
      ItemSeparatorComponent={Separator}
      renderItem={({ item }) =>
        // TODO: should move this out of this file and pass as props
        item.id === CREATE_ID ? (
          <Pressable
            style={({ pressed }) => [
              styles.row,
              styles.createRow,
              pressed && styles.rowPressed,
            ]}
            onPress={() => onSelect(item)}
          >
            <AppText variant="body" color={colors.textSecondary}>
              Create{" "}
            </AppText>
            <Chip label={item.label} color={item.color ?? colors.tint} />
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => onSelect(item)}
          >
            <Chip label={item.label} color={item.color ?? colors.tint} />
          </Pressable>
        )
      }
    />
  );
}

function DropdownHeader() {
  return (
    <View style={styles.header}>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  header: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  createRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
