import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppText } from "@/components/ux/AppText";
import { PaginationDots } from "@/components/ux/PaginationDots";
import { markOnboardingDone } from "@/lib/onboarding";
import { colors, spacing } from "@/theme";

import { OnboardingPage } from "./OnboardingPage";
import { ONBOARDING_PAGES } from "./onboardingData";

export { hasCompletedOnboarding, markOnboardingDone } from "@/lib/onboarding";

export function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isFirst = currentIndex === 0;
  const currentPage = ONBOARDING_PAGES[currentIndex];
  const FooterComponent = currentPage.footerComponent;

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
    if (currentIndex < ONBOARDING_PAGES.length - 1) scrollTo(currentIndex + 1);
  }

  async function handleSkip() {
    await markOnboardingDone();
    router.replace("/(tabs)");
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

        <TouchableOpacity style={styles.headerButton} onPress={handleSkip} hitSlop={8}>
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

        {FooterComponent ? (
          <FooterComponent onContinue={handleContinue} />
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
});
