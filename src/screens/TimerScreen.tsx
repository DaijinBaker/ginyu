import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors, Spacing, Typography} from '../constants';
import {useTimer} from '../hooks/useTimer';
import {formatTime} from '../utils/formatTime';
import type {TimerPhase} from '../features/timer/timerSlice';
import CountdownRing from '../components/CountdownRing';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPhaseColor(
  phase: TimerPhase,
  secondsRemaining: number,
  warningTime: number,
): string {
  if (phase === 'complete') return Colors.success;
  if (phase === 'rest') return Colors.timerRest;
  if (phase === 'prep') return Colors.grey600;
  if (phase === 'work') {
    return secondsRemaining <= warningTime
      ? Colors.timerWarning
      : Colors.timerWork;
  }
  return Colors.grey800;
}

function getPhaseLabel(phase: TimerPhase): string {
  switch (phase) {
    case 'prep':
      return 'GET READY';
    case 'work':
      return 'ROUND';
    case 'rest':
      return 'REST';
    case 'complete':
      return 'SESSION COMPLETE';
    default:
      return '';
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TimerScreen() {
  const navigation = useNavigation();
  const {timer, config, handleToggleRunning, handleReset} = useTimer();
  const {phase, secondsRemaining, currentRound, totalRounds, isRunning} = timer;

  const accentColor = getPhaseColor(phase, secondsRemaining, config.warningTime);
  const isIdle = phase === 'idle';
  const isComplete = phase === 'complete';

  return (
    <View style={styles.container}>
      {/* Phase accent bar at top */}
      <View style={[styles.accentBar, {backgroundColor: accentColor}]} />

      {/* Main content */}
      <View style={styles.content}>

        {/* Centre block — flex:1 so it fills available space and centres its content */}
        <View style={styles.centerWrapper}>
        {isIdle ? (
          <View style={styles.idleContainer}>
            <Text style={styles.idleTitle}>GINYU</Text>
            <Text style={Typography.bodySmall}>
              {config.rounds} rounds ·{' '}
              {Math.floor(config.roundDuration / 60)}:
              {String(config.roundDuration % 60).padStart(2, '0')} work ·{' '}
              {config.restDuration}s rest
            </Text>
          </View>
        ) : isComplete ? (
          <View style={styles.completeContainer}>
            <Text style={styles.completeIcon}>🥊</Text>
            <Text style={[styles.phaseLabel, {color: accentColor}]}>
              {getPhaseLabel(phase)}
            </Text>
            <Text style={Typography.bodySmall}>
              {totalRounds} rounds completed
            </Text>
          </View>
        ) : (
          <View style={styles.centerBlock}>
            {(phase === 'work' || phase === 'rest') && (
              <Text style={styles.roundText}>
                {currentRound}
                <Text style={styles.roundTotal}> / {totalRounds}</Text>
              </Text>
            )}
            <CountdownRing
              secondsRemaining={secondsRemaining}
              totalPhaseDuration={timer.totalPhaseDuration}
              color={accentColor}
              label={getPhaseLabel(phase)}
            />
          </View>
        )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Primary action: Start / Pause / Resume / Again */}
          <TouchableOpacity
            style={[styles.primaryButton, {backgroundColor: accentColor}]}
            onPress={handleToggleRunning}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>
              {isIdle
                ? 'START'
                : isComplete
                ? 'GO AGAIN'
                : isRunning
                ? 'PAUSE'
                : 'RESUME'}
            </Text>
          </TouchableOpacity>

          {/* Reset — shown whenever a session has been started */}
          {!isIdle && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                handleReset();
              }}
              activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>RESET</Text>
            </TouchableOpacity>
          )}

          {/* Back to home — shown on idle or complete */}
          {(isIdle || isComplete) && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                handleReset();
                navigation.goBack();
              }}
              activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>HOME</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxxl,
  },

  // Center wrapper — takes all available space and centres content vertically
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Center block
  centerBlock: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  roundRow: {
    alignItems: 'center',
  },
  roundText: {
    ...Typography.h2,
    textAlign: 'center',
  },
  roundTotal: {
    ...Typography.h3,
    color: Colors.grey400,
  },

  // Countdown
  phaseLabel: {
    ...Typography.label,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  countdown: {
    fontSize: 112,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -4,
    textAlign: 'center',
    lineHeight: 120,
  },

  // Idle state
  idleContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  idleTitle: {
    ...Typography.h1,
    letterSpacing: 8,
  },

  // Complete state
  completeContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  completeIcon: {
    fontSize: 64,
  },

  // Controls
  controls: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    borderRadius: 8,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.h2,
    letterSpacing: 4,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.grey600,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...Typography.label,
    letterSpacing: 3,
    color: Colors.grey400,
  },
});
