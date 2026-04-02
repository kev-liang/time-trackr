import { Image, StyleSheet, useWindowDimensions, View } from "react-native";

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
        {page.image ? (
          <Image
            source={page.image}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.illustration}>
            <IconSymbol
              name={page.iconName as any}
              size={64}
              color={colors.tint}
            />
          </View>
        )}
      </View>

      <View style={styles.textBlock}>
        <AppText variant="title">{page.title}</AppText>
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
    flex: 2,
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
  image: {
    flex: 1,
    width: "100%",
  },
  textBlock: {
    gap: spacing.md,
  },
});
