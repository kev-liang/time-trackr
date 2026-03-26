import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlatList } from "react-native-gesture-handler";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";

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
  onEdit?: (item: DropdownItem) => void;
  onDelete?: (item: DropdownItem) => void;
};

export function AutocompleteDropdown({
  data,
  onSelect,
  onEdit,
  onDelete,
}: AutocompleteDropdownProps) {
  return (
    <FlatList<DropdownItem>
      nestedScrollEnabled
      data={data}
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
            onPress={() => { Keyboard.dismiss(); onSelect(item); }}
          >
            <AppText variant="body" color={colors.textSecondary}>
              Create{" "}
            </AppText>
            <Chip label={item.label} color={item.color ?? colors.tint} />
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.row, styles.existingRow, pressed && styles.rowPressed]}
            onPress={() => { Keyboard.dismiss(); onSelect(item); }}
          >
            <Chip label={item.label} color={item.color ?? colors.tint} />
            <View style={styles.actions}>
              {onEdit && (
                <Pressable
                  hitSlop={8}
                  onPress={() => { Keyboard.dismiss(); onEdit(item); }}
                >
                  <MaterialCommunityIcons name="pencil" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
              {onDelete && (
                <Pressable
                  hitSlop={8}
                  onPress={() => { Keyboard.dismiss(); onDelete(item); }}
                >
                  <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>
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
  existingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  createRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
