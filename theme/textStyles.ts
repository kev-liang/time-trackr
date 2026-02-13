import { StyleSheet } from 'react-native';

import { fonts } from './fonts';

export const textStyles = StyleSheet.create({
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySemiBold: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});

export type TextVariant = keyof typeof textStyles;
