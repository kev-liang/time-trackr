const palette = {
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F5F5F5',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  blue500: '#0A7EA4',
} as const;

export const colors = {
  light: {
    text: palette.gray900,
    textSecondary: palette.gray500,
    background: palette.white,
    surface: palette.gray100,
    tint: palette.blue500,
    border: palette.gray300,
    icon: palette.gray500,
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    surface: '#1E2022',
    tint: palette.white,
    border: '#2E3234',
    icon: '#9BA1A6',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;
