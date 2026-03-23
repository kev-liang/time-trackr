import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ux/AppText";
import { purchaseOffering, restorePurchases } from "@/lib/purchases";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { colors, spacing } from "@/theme";

const FEATURES: { label: string; pro: boolean }[] = [
  { label: "Track up to 3 activities", pro: false },
  { label: "Unlimited activities", pro: true },
];

export function PaywallScreen() {
  const [loading, setLoading] = useState<"purchase" | "restore" | null>(null);
  const checkSubscription = useSubscriptionStore((s) => s.checkSubscription);

  async function handlePurchase() {
    setLoading("purchase");
    try {
      await purchaseOffering();
      await checkSubscription();
      router.replace("/(tabs)");
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert("Something went wrong", "Please try again.");
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleRestore() {
    setLoading("restore");
    try {
      const active = await restorePurchases();
      if (active) {
        await checkSubscription();
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          "No subscription found",
          "We couldn't find a previous purchase to restore.",
        );
      }
    } catch {
      Alert.alert("Something went wrong", "Please try again.");
    } finally {
      setLoading(null);
    }
  }

  function handleContinueFree() {
    router.replace("/(tabs)");
  }

  const busy = loading !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.textBlock}>
          <AppText variant="title" style={styles.title}>
            TimeTracer Free
          </AppText>
          <AppText
            variant="body"
            color={colors.textSecondary}
            style={styles.subtitle}
          >
            You can track up to 3 activities.{"\n"}Upgrade for unlimited.
          </AppText>
        </View>

        <View style={styles.card}>
          {FEATURES.map((f, i) => (
            <FeatureRow
              key={f.label}
              label={f.label}
              pro={f.pro}
              showDivider={i < FEATURES.length - 1}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              busy && styles.disabled,
            ]}
            onPress={handlePurchase}
            activeOpacity={0.8}
            disabled={busy}
          >
            {loading === "purchase" ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <AppText variant="bodySemiBold" color={colors.background}>
                Get Pro for $3
              </AppText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinueFree}
            disabled={busy}
            hitSlop={8}
            style={styles.secondaryButton}
          >
            <AppText variant="bodySemiBold" color={colors.textSecondary}>
              Continue with Free
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRestore}
            disabled={busy}
            hitSlop={8}
            style={styles.restoreButton}
          >
            {loading === "restore" ? (
              <ActivityIndicator color={colors.textSecondary} size="small" />
            ) : (
              <AppText variant="bodySemiBold" color={colors.textSecondary}>
                Restore Purchase
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

type FeatureRowProps = {
  label: string;
  pro: boolean;
  showDivider: boolean;
};

function FeatureRow({ label, pro, showDivider }: FeatureRowProps) {
  return (
    <>
      <View style={styles.featureRow}>
        <AppText variant="body">{label}</AppText>
        {pro ? (
          <View style={styles.proBadge}>
            <AppText variant="bodySemiBold" color={colors.background}>
              Pro
            </AppText>
          </View>
        ) : (
          <View style={styles.freeFeature}>
            <AppText variant="bodySemiBold" color={colors.textSecondary}>
              Free
            </AppText>
          </View>
        )}
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
    gap: spacing.xl,
  },
  textBlock: {
    gap: spacing.sm,
    alignItems: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  proBadge: {
    backgroundColor: colors.tint,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  actions: {
    gap: spacing.md,
    alignItems: "center",
  },
  button: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.tint,
  },
  disabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  restoreButton: {
    paddingVertical: spacing.xs,
  },
  freeFeature: {
    marginRight: spacing.sm,
  },
});
