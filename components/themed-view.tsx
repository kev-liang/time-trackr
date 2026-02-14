import { View, type ViewProps } from 'react-native';

import { colors } from '@/theme';

export function ThemedView({ style, ...otherProps }: ViewProps) {
  return <View style={[{ backgroundColor: colors.background }, style]} {...otherProps} />;
}
