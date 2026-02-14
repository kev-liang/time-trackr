import { Text, type TextProps } from 'react-native';

import { colors } from '@/theme';
import { textStyles, type TextVariant } from '@/theme';

type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
};

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  return <Text style={[textStyles[variant], { color: color ?? colors.text }, style]} {...rest} />;
}
