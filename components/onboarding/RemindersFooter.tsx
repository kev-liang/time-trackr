import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { markOnboardingDone } from "@/lib/onboarding";
import { colors, spacing } from "@/theme";

import type { FooterProps } from "./onboardingData";

export function RemindersFooter(_: FooterProps) {
  const [loading, setLoading] = useState(false);

  async function handleSetUpReminders() {
    setLoading(true);
    await markOnboardingDone();
    router.replace("/(tabs)/alarms");
  }

  async function handleNotNow() {
    await markOnboardingDone();
    router.replace("/(tabs)");
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleSetUpReminders}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <AppText variant="bodySemiBold" color={colors.background}>
            Set up reminders
          </AppText>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleNotNow}
        disabled={loading}
        hitSlop={8}
        style={styles.notNow}
      >
        <AppText variant="bodySemiBold" color={colors.textSecondary}>
          Not now
        </AppText>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.tint,
  },
  notNow: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
});
