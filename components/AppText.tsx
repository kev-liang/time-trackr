import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { textStyles, type TextVariant } from '@/theme';

type AppTextProps = TextProps & {
  variant?: TextVariant;
  color?: string;
};

export function AppText({ variant = 'body', color, style, ...rest }: AppTextProps) {
  const themeColor = useThemeColor({}, 'text');

  return <Text style={[textStyles[variant], { color: color ?? themeColor }, style]} {...rest} />;
}
