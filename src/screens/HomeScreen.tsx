import React from 'react';
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../hooks/useAppStore';
import {updateConfig, resetConfig} from '../features/session/sessionSlice';
import {startSession} from '../features/timer/timerSlice';
import type {SessionConfig} from '../features/session/sessionSlice';
import {Colors, Spacing, Typography} from '../constants';

function formatValue(key: keyof SessionConfig, value: number): string {
  if (key === 'rounds') {
    return String(value);
  }
  if (value < 60) {
    return `${value}s`;
  }
  const m = Math.floor(value / 60);
  const s = value % 60;
  return s === 0 ? `${m}:00` : `${m}:${String(s).padStart(2, '0')}`;
}

interface SettingItem {
  key: keyof SessionConfig;
  label: string;
  step: number;
  min: number;
  max: number;
}

const SETTINGS: SettingItem[] = [
  {key: 'rounds', label: 'BATTLES', step: 1, min: 1, max: 20},
  {key: 'roundDuration', label: 'ROUND', step: 5, min: 5, max: 600},
  {key: 'restDuration', label: 'RECOVERY', step: 5, min: 0, max: 300},
  {key: 'prepDuration', label: 'POWER UP', step: 5, min: 0, max: 60},
  {key: 'warningTime', label: 'ALERT', step: 5, min: 0, max: 60},
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const config = useAppSelector(state => state.session.config);

  const adjust = (
    key: keyof SessionConfig,
    delta: number,
    min: number,
    max: number,
  ) => {
    const next = Math.min(max, Math.max(min, config[key] + delta));
    dispatch(updateConfig({[key]: next}));
  };

  return (
    <ImageBackground
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      source={require('../../assets/HomeScreen.jpeg')}
      style={styles.background}
      resizeMode="cover">
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h3, styles.title]}>Hyperbolic Timer</Text>
      </View>

      <View style={styles.cards}>
        {SETTINGS.map(({key, label, step, min, max}) => (
          <View key={key} style={styles.card}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardValue}>{formatValue(key, config[key])}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => adjust(key, -step, min, max)}
                activeOpacity={0.7}>
                <Text style={styles.stepText}>−</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => adjust(key, step, min, max)}
                activeOpacity={0.7}>
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            dispatch(startSession({...config, now: Date.now()}));
            navigation.navigate('Timer');
          }}
          activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>FIGHT!</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => dispatch(resetConfig())}
          activeOpacity={0.7}>
          <Text style={styles.resetText}>RESET TO DEFAULTS</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  title: {
    letterSpacing: 2,
    color: Colors.grey100,
  },
  subtitle: {
    marginTop: Spacing.md,
  },
  cards: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  card: {
    backgroundColor: 'rgba(8, 20, 40, 0.72)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grey600,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    ...Typography.label,
    flex: 1,
  },
  cardValue: {
    ...Typography.h3,
    flex: 1,
    textAlign: 'center',
  },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.grey600,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.grey800,
  },
  stepText: {
    ...Typography.h3,
    lineHeight: 28,
  },
  actions: {
    gap: Spacing.md,
    paddingTop: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.h2,
    letterSpacing: 4,
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: Colors.grey600,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  resetText: {
    ...Typography.label,
  },
});
