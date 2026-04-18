export const Colors = {
  // Brand
  primary: '#E8360A',
  primaryDark: '#B82908',

  // Neutrals
  black: '#0A0A0A',
  white: '#FFFFFF',
  grey100: '#F5F5F5',
  grey200: '#E0E0E0',
  grey400: '#9E9E9E',
  grey600: '#616161',
  grey800: '#212121',

  // Semantic
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',

  // Timer states
  timerWork: '#E8360A',
  timerRest: '#2ECC71',
  timerWarning: '#F39C12',
} as const;

export type ColorsType = typeof Colors;
