export const Colors = {
  // Brand
  primary: '#0038a8',
  primaryDark: '#002880',

  // Neutrals
  black: '#0a0e1a',
  white: '#FFFFFF',
  grey100: '#F5F5F5',
  grey200: '#E0E0E0',
  grey400: '#5577aa',
  grey600: '#1e3a5f',
  grey800: '#111827',

  // Semantic
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',

  // Timer states
  timerWork: '#0038a8',
  timerRest: '#2ECC71',
  timerWarning: '#F39C12',
} as const;

export type ColorsType = typeof Colors;
