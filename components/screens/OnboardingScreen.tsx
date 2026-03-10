import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedView } from "@/components/themed-view";
import { AppText } from "@/components/ux/AppText";
import { registerBackgroundReschedule } from "@/lib/notificationScheduler";
import { requestPermissions, scheduleNotifications } from "@/lib/notifications";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { colors, spacing } from "@/theme";

const ONBOARDING_KEY = "onboarding_done";

export async function markOnboardingDone() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "1");
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val !== null;
}

function MockNotification() {
  return (
    <View style={styles.mockCard}>
      <View style={styles.mockHeader}>
        <View style={styles.mockAppIcon}>
          <IconSymbol name="bell.fill" size={18} color={colors.background} />
        </View>
        <AppText variant="caption" color={colors.textSecondary} style={styles.mockAppName}>
          TIMETRACER
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          now
        </AppText>
      </View>
      <AppText variant="bodySemiBold">What have you been doing?</AppText>
      <AppText variant="body" color={colors.textSecondary}>
        Tap to log your last activity.
      </AppText>
    </View>
  );
}

export function OnboardingScreen() {
  const [loading, setLoading] = useState(false);

  async function handleSetUpReminders() {
    setLoading(true);
    await markOnboardingDone();
    const granted = await requestPermissions();
    if (granted) {
      await scheduleNotifications(useAlarmStore.getState());
      await registerBackgroundReschedule();
    }
    router.replace("/(tabs)");
  }

  async function handleSkip() {
    await markOnboardingDone();
    router.replace("/(tabs)");
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.top}>
            <AppText variant="title">Welcome to{"\n"}TimeTracer</AppText>
            <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
              Stay on top of your day with reminders to log what you've been working on.
            </AppText>
          </View>

          <View style={styles.middle}>
            <MockNotification />
            <AppText variant="body" color={colors.textSecondary}>
              TimeTracer nudges you throughout the day so your activity log stays accurate — you can configure frequency and schedule anytime in the Reminders tab.
            </AppText>
          </View>
        </View>

        <View style={styles.buttons}>
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
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSkip}
            disabled={loading}
            activeOpacity={0.8}
          >
            <AppText variant="bodySemiBold" color={colors.text}>
              Skip for now
            </AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xxl,
  },
  top: {
    gap: spacing.md,
  },
  subtitle: {
    maxWidth: 300,
  },
  middle: {
    gap: spacing.lg,
  },
  mockCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  mockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  mockAppIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  mockAppName: {
    flex: 1,
    letterSpacing: 0.5,
  },
  buttons: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  button: {
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: colors.tint,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
