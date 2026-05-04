import React from 'react';
import {Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors, Spacing, Typography} from '../constants';
import {useAppDispatch, useAppSelector} from '../hooks/useAppStore';
import {updateConfig, SessionConfig} from '../features/session/sessionSlice';
import {startSession} from '../features/timer/timerSlice';

interface StepperRowProps {
  label: string;
  value: number;
  suffix?: string;
  step: number;
  min: number;
  max: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

function StepperRow({
  label,
  value,
  suffix = '',
  onDecrement,
  onIncrement,
  min,
  max,
}: StepperRowProps) {
  return (
    <View style={styles.row}>
      <Text style={Typography.bodySmall}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          style={({pressed}) => [
            styles.stepBtn,
            pressed && styles.stepBtnPressed,
            value <= min && styles.stepBtnDisabled,
          ]}
          onPress={onDecrement}
          disabled={value <= min}
          hitSlop={8}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={[Typography.body, styles.stepValue]}>
          {value}
          {suffix}
        </Text>
        <Pressable
          style={({pressed}) => [
            styles.stepBtn,
            pressed && styles.stepBtnPressed,
            value >= max && styles.stepBtnDisabled,
          ]}
          onPress={onIncrement}
          disabled={value >= max}
          hitSlop={8}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const config = useAppSelector(state => state.session.config);
  const dispatch = useAppDispatch();

  function patch(partial: Partial<SessionConfig>) {
    dispatch(updateConfig(partial));
  }

  function handleStart() {
    dispatch(startSession({...config, now: Date.now()}));
    navigation.navigate('Timer');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={Typography.h1}>GINYU</Text>
        <Text style={[Typography.label, styles.subtitle]}>
          Boxing &amp; Sparring Timer
        </Text>
      </View>

      <View style={styles.settings}>
        <StepperRow
          label="Rounds"
          value={config.rounds}
          step={1}
          min={1}
          max={20}
          onDecrement={() => patch({rounds: config.rounds - 1})}
          onIncrement={() => patch({rounds: config.rounds + 1})}
        />
        <StepperRow
          label="Round duration"
          value={config.roundDuration}
          suffix="s"
          step={5}
          min={5}
          max={600}
          onDecrement={() => patch({roundDuration: config.roundDuration - 5})}
          onIncrement={() => patch({roundDuration: config.roundDuration + 5})}
        />
        <StepperRow
          label="Rest duration"
          value={config.restDuration}
          suffix="s"
          step={5}
          min={0}
          max={300}
          onDecrement={() => patch({restDuration: config.restDuration - 5})}
          onIncrement={() => patch({restDuration: config.restDuration + 5})}
        />
        <StepperRow
          label="Prep time"
          value={config.prepDuration}
          suffix="s"
          step={5}
          min={0}
          max={60}
          onDecrement={() => patch({prepDuration: config.prepDuration - 5})}
          onIncrement={() => patch({prepDuration: config.prepDuration + 5})}
        />
        <StepperRow
          label="Warning time"
          value={config.warningTime}
          suffix="s"
          step={1}
          min={0}
          max={60}
          onDecrement={() => patch({warningTime: config.warningTime - 1})}
          onIncrement={() => patch({warningTime: config.warningTime + 1})}
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleStart}
        activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>START</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  settings: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grey800,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.grey800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnPressed: {
    backgroundColor: Colors.grey600,
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    lineHeight: 22,
  },
  stepValue: {
    minWidth: 52,
    textAlign: 'center',
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
});
