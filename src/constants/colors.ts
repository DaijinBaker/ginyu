export const Colors = {
  // Brand — amber gold matching the sun halo
  primary: '#E8A020',
  primaryDark: '#B87B10',

  // Neutrals — deep teal navy from the artwork
  black: '#080f1a',
  white: '#FFFFFF',
  grey100: '#F5F0E8',
  grey200: '#D4B870',
  grey400: '#C8A060',
  grey600: '#1e4060',
  grey800: '#0d1e30',

  // Semantic
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',

  // Timer states
  timerWork: '#E8A020',
  timerRest: '#2ECC71',
  timerWarning: '#FF2020',
} as const;

export type ColorsType = typeof Colors;
