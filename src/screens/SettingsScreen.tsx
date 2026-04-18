import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors, Spacing, Typography} from '../constants';
import {useAppDispatch, useAppSelector} from '../hooks/useAppStore';
import {resetConfig, SessionConfig, updateConfig} from '../features/session/sessionSlice';

interface StepperRowProps {
  label: string;
  value: number;
  /** Display suffix, e.g. "s" or "" */
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

export default function SettingsScreen() {
  const config = useAppSelector(state => state.session.config);
  const dispatch = useAppDispatch();

  function patch(partial: Partial<SessionConfig>) {
    dispatch(updateConfig(partial));
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <Text style={Typography.h3}>Session Config</Text>

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

      <Pressable
        style={({pressed}) => [
          styles.resetBtn,
          pressed && styles.resetBtnPressed,
        ]}
        onPress={() => dispatch(resetConfig())}>
        <Text style={styles.resetBtnText}>Reset to Defaults</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  container: {
    padding: Spacing.xl,
    gap: Spacing.lg,
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
  resetBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.grey600,
    alignItems: 'center',
  },
  resetBtnPressed: {
    backgroundColor: Colors.grey800,
  },
  resetBtnText: {
    ...Typography.body,
    color: Colors.grey400,
  },
});
