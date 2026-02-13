import { StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { ThemedView } from '@/components/themed-view';
import { spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <AppText variant="title">Time Trackr</AppText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
});
