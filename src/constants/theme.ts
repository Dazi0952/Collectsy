
export const Colors = {
  primary: '#007AFF',    
  background: '#FFFFFF', 
  surface: '#F5F5F7',    
  text: '#1C1C1E',      
  textSecondary: '#8A8A8E', 
  border: '#E5E5EA',      
  danger: '#FF3B30',      
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