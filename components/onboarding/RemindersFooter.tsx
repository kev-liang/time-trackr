import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { analytics } from "@/lib/analytics";
import { markOnboardingDone } from "@/lib/onboarding";
import { colors, spacing } from "@/theme";

import type { FooterProps } from "./onboardingData";

export function RemindersFooter(_: FooterProps) {
  const [loading, setLoading] = useState(false);

  async function handleNotNow() {
    setLoading(true);
    analytics.capture("onboarding_completed");
    await markOnboardingDone();
    router.replace("/paywall");
  }

  return (
    <TouchableOpacity
      style={[styles.button, styles.primaryButton]}
      onPress={handleNotNow}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.background} />
      ) : (
        <AppText variant="bodySemiBold" color={colors.background}>
          Continue
        </AppText>
      )}
    </TouchableOpacity>
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
});
