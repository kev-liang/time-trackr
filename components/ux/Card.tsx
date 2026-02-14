import { type PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/ux/AppText";
import { colors, spacing } from "@/theme";

type CardProps = PropsWithChildren<{
  title?: string;
}>;

export function Card({ title, children }: CardProps) {
  return (
    <View style={styles.card}>
      {title && (
        <>
          <AppText variant="subtitle">{title}</AppText>
          <View style={styles.divider} />
        </>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
