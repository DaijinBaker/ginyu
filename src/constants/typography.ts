import {StyleSheet} from 'react-native';
import {Colors} from './colors';

export const Typography = StyleSheet.create({
  displayLarge: {
    fontSize: 96,
    fontWeight: '700',
    letterSpacing: -1.5,
    color: Colors.white,
  },
  displayMedium: {
    fontSize: 60,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: Colors.white,
  },
  h1: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.white,
  },
  h2: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.white,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.white,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.white,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grey400,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.grey400,
  },
});
