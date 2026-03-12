import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppText } from "@/components/ux/AppText";
import { PaginationDots } from "@/components/ux/PaginationDots";
import { registerBackgroundReschedule } from "@/lib/notificationScheduler";
import { requestPermissions, scheduleNotifications } from "@/lib/notifications";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { colors, spacing } from "@/theme";

import { OnboardingPage } from "./OnboardingPage";

const ONBOARDING_KEY = "onboarding_done";

export async function markOnboardingDone() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "1");
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val !== null;
}
import { ONBOARDING_PAGES } from "./onboardingData";

const LAST_INDEX = ONBOARDING_PAGES.length - 1;

export function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === LAST_INDEX;

  const scrollTo = useCallback(
    (index: number) => {
      flatListRef.current?.scrollToOffset({ offset: index * width, animated: true });
      setCurrentIndex(index);
    },
    [width]
  );

  function handleBack() {
    if (currentIndex > 0) scrollTo(currentIndex - 1);
  }

  function handleContinue() {
    if (currentIndex < LAST_INDEX) scrollTo(currentIndex + 1);
  }

  async function handleSkip() {
    await markOnboardingDone();
    router.replace("/(tabs)");
  }

  async function handleNotNow() {
    await markOnboardingDone();
    router.replace("/(tabs)");
  }

  async function handleSetUpReminders() {
    setLoading(true);
    await markOnboardingDone();
    const granted = await requestPermissions();
    router.replace("/(tabs)/alarms");
    if (granted) {
      scheduleNotifications(useAlarmStore.getState());
      registerBackgroundReschedule();
    }
  }

  function handleMomentumScrollEnd(e: any) {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerButton, isFirst && styles.hidden]}
          onPress={handleBack}
          disabled={isFirst}
          hitSlop={8}
        >
          <IconSymbol name="chevron.left" size={16} color={colors.text} />
          <AppText variant="bodySemiBold">Back</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSkip}
          hitSlop={8}
        >
          <AppText variant="bodySemiBold">Skip</AppText>
          <IconSymbol name="chevron.right" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Pages */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_PAGES}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <OnboardingPage page={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={styles.flatList}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Bottom */}
      <View style={styles.bottom}>
        <PaginationDots count={ONBOARDING_PAGES.length} activeIndex={currentIndex} />

        {isLast ? (
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
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <AppText variant="bodySemiBold" color={colors.background}>
              Continue
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hidden: {
    opacity: 0,
    pointerEvents: "none",
  },
  flatList: {
    flex: 1,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
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
