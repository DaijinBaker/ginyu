import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors, Spacing, Typography} from '../constants';

/**
 * TimerScreen — the active workout view.
 * Full timer logic (useTimer hook) will be built out as a separate feature.
 */
export default function TimerScreen() {
  return (
    <View style={styles.container}>
      <Text style={Typography.label}>ROUND</Text>
      <Text style={styles.roundText}>1 / 8</Text>
      <Text style={styles.timerText}>3:00</Text>
      <Text style={[Typography.label, styles.phaseLabel]}>WORK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  roundText: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  timerText: {
    ...Typography.displayLarge,
    fontSize: 120,
  },
  phaseLabel: {
    color: Colors.timerWork,
    marginTop: Spacing.md,
  },
});
