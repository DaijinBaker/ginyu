import {Platform, StyleSheet} from 'react-native';
import {Colors} from './colors';

const MONO = Platform.select({ios: 'Courier New', android: 'monospace'});

export const Typography = StyleSheet.create({
  displayLarge: {
    fontFamily: MONO,
    fontSize: 96,
    fontWeight: '700',
    letterSpacing: -1.5,
    color: Colors.white,
  },
  displayMedium: {
    fontFamily: MONO,
    fontSize: 60,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: Colors.white,
  },
  h1: {
    fontFamily: MONO,
    fontSize: 40,
    fontWeight: '700',
    color: Colors.white,
  },
  h2: {
    fontFamily: MONO,
    fontSize: 32,
    fontWeight: '600',
    color: Colors.white,
  },
  h3: {
    fontFamily: MONO,
    fontSize: 24,
    fontWeight: '600',
    color: Colors.white,
  },
  body: {
    fontFamily: MONO,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.white,
  },
  bodySmall: {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grey400,
  },
  label: {
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Colors.grey400,
  },
});
