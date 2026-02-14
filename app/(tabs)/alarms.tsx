import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { AppText } from "@/components/ux/AppText";
import { colors } from "@/theme";

export default function AlarmsScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <AppText variant="body" color={colors.textSecondary}>
          Alarms coming soon
        </AppText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
