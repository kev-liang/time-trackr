import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { colors } from "@/theme";

type FabProps = {
  label?: string;
  onPress: () => void;
};

export function AddEventFAB({ label, onPress }: FabProps) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Ionicons name="add" size={28} color={colors.background} />
      {label && (
        <AppText variant="bodySemiBold" color={colors.background}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    backgroundColor: colors.tint,
    borderRadius: 28,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
