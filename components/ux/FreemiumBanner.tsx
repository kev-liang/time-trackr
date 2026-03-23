import { router } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { useActivityHistoryStore } from "@/stores/useActivityHistoryStore";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { colors, spacing } from "@/theme";

const FREE_LIMIT = 3;

export function FreemiumBanner() {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const items = useActivityHistoryStore((s) => s.items);

  if (isPro) return null;

  const uniqueCount = items.length;

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={() => router.push("/paywall")}
      activeOpacity={0.7}
    >
      <AppText variant="body" color={colors.tint} style={styles.text}>
        You are using {uniqueCount} / {FREE_LIMIT} free activities. Tap to
        upgrade.
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: `${colors.tint}18`,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  text: {
    textAlign: "center",
  },
});
