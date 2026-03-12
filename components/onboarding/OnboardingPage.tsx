import { StyleSheet, useWindowDimensions, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppText } from "@/components/ux/AppText";
import { colors, spacing } from "@/theme";

import type { OnboardingPageData } from "./onboardingData";

type Props = {
  page: OnboardingPageData;
};

export function OnboardingPage({ page }: Props) {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.illustrationContainer}>
        <View style={styles.illustration}>
          <IconSymbol name={page.iconName as any} size={64} color={colors.tint} />
        </View>
      </View>

      <View style={styles.textBlock}>
        <AppText variant="title">{page.title}</AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.description}>
          {page.description}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "flex-end",
    gap: spacing.xl,
    paddingBottom: spacing.lg,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: 160,
    height: 160,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    gap: spacing.md,
  },
  description: {
    lineHeight: 26,
  },
});
