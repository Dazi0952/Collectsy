// src/constants/theme.ts
export const Colors = {
  primary: '#007AFF',    // Główny kolor akcentu (np. przyciski) - niebieski Apple
  background: '#FFFFFF', // Tło aplikacji
  surface: '#F5F5F7',    // Tło dla elementów "na wierzchu" (np. pole wyszukiwania)
  text: '#1C1C1E',      // Główny kolor tekstu
  textSecondary: '#8A8A8E', // Kolor dla mniej ważnego tekstu (szary)
  border: '#E5E5EA',      // Kolor ramek i separatorów
  danger: '#FF3B30',      // Kolor dla akcji destrukcyjnych (np. usuwanie)
};

export const FontSize = {
  title: 28,
  headline: 22,
  body: 17,
  subheadline: 15,
  caption: 12,
};

export const Spacing = {
  small: 8,
  medium: 16,
  large: 24,
};

const palette = {
  blue: '#007AFF',
  grayLight: '#F5F5F7',
  grayMedium: '#E5E5EA',
  grayDark: '#8A8A8E',
  white: '#FFFFFF',
  black: '#1C1C1E',
  red: '#FF3B30',
  // Ciemne kolory
  darkSurface: '#1C1C1E',
  darkBackground: '#000000',
};

export const lightTheme = {
  primary: palette.blue,
  background: palette.white,
  surface: palette.grayLight,
  text: palette.black,
  textSecondary: palette.grayDark,
  border: palette.grayMedium,
  danger: palette.red,
};

export const darkTheme = {
  primary: palette.blue,
  background: palette.darkBackground,
  surface: palette.darkSurface,
  text: palette.white,
  textSecondary: palette.grayDark,
  border: palette.darkSurface,
  danger: palette.red,
};