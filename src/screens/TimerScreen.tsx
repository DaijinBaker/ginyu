import React, {useEffect, useRef, useState} from 'react';
import {Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Video, {ResizeMode} from 'react-native-video';
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

// ── Round GIF assets ─────────────────────────────────────────────────────────

const ROUND_CHARS = ['ssj', 'ssj2', 'ssj3', 'ssgod', 'ssb', 'ssbk', 'ssui'] as const;
type RoundChar = (typeof ROUND_CHARS)[number];

/** Duration in ms of each transform GIF (used to time the overlay removal) */
const TRANSFORM_DURATIONS_MS: Record<Exclude<RoundChar, 'ssj3'>, number> = {
  ssj: 6000,
  ssj2: 8000,
  ssgod: 10000,
  ssb: 5000,
  ssbk: 23000, // single play is 24000ms
  ssui: 8000, // Part 1 animation is 4580ms; extra time lets the reveal frame show before idle
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const IDLE_GIFS: Record<RoundChar, ImageSourcePropType> = {
  ssj: require('../../assets/idle_ssj.gif'),
  ssj2: require('../../assets/idle_ssj2.gif'),
  ssj3: require('../../assets/idle_ssj3.gif'),
  ssgod: require('../../assets/idle_ssgod.gif'),
  ssb: require('../../assets/idle_ssb.gif'),
  ssbk: require('../../assets/idle_ssbk.gif'),
  ssui: require('../../assets/idle_ssui.gif'),
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const TRANSFORM_GIFS: Record<Exclude<RoundChar, 'ssj3'>, ImageSourcePropType> = {
  ssj: require('../../assets/transform_ssj.gif'),
  ssj2: require('../../assets/transform_ssj2.gif'),
  ssgod: require('../../assets/transform_ssgod.gif'),
  ssb: require('../../assets/transform_ssb.gif'),
  ssbk: require('../../assets/transform_ssbk.gif'),
  ssui: require('../../assets/transform_ssui.gif'),
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TimerScreen() {
  const navigation = useNavigation();
  const {timer, config, handleToggleRunning, handleReset, handleSkip} = useTimer();
  const {phase, secondsRemaining, currentRound, totalRounds, isRunning} = timer;

  const accentColor = getPhaseColor(phase, secondsRemaining, config.warningTime);
  const isComplete = phase === 'complete';
  const isIdle = phase === 'idle';
  const primaryButtonBg = !isRunning && !isComplete ? Colors.primary : accentColor;

  // Prep GIF: idle_base preloaded behind transform_base; show idle after 5 s
  const [showIdleGif, setShowIdleGif] = useState(false);
  useEffect(() => {
    if (phase !== 'prep') {
      setShowIdleGif(false);
      return;
    }
    setShowIdleGif(false);
    const switchTimer = setTimeout(() => setShowIdleGif(true), 5000);
    return () => clearTimeout(switchTimer);
  }, [phase]);

  // Round GIF: idle_ss* preloaded behind transform; idle persists through rest
  const [showRoundIdleGif, setShowRoundIdleGif] = useState(false);
  // Guard against stale onEnd firing when Video unmounts between rounds
  const videoActiveRef = useRef(false);
  const roundChar: RoundChar =
    ROUND_CHARS[Math.max(0, currentRound - 1) % ROUND_CHARS.length];

  useEffect(() => {
    if (phase === 'rest') {
      return; // idle gif persists through rest, keep state as-is
    }
    if (phase !== 'work') {
      setShowRoundIdleGif(false);
      return;
    }
    setShowRoundIdleGif(false);
    if (roundChar === 'ssj3') {
      videoActiveRef.current = true;
      // Safety timeout: switch to idle if video fails to fire onEnd
      const capMs = Math.max(
        1000,
        Math.min(30000, config.roundDuration * 1000 - 2000),
      );
      const t = setTimeout(() => {
        if (videoActiveRef.current) setShowRoundIdleGif(true);
      }, capMs);
      return () => {
        videoActiveRef.current = false;
        clearTimeout(t);
      };
    }
    const rawMs = TRANSFORM_DURATIONS_MS[roundChar as Exclude<RoundChar, 'ssj3'>];
    const capMs = Math.max(
      1000,
      Math.min(rawMs, config.roundDuration * 1000 - 2000),
    );
    const t = setTimeout(() => setShowRoundIdleGif(true), capMs);
    return () => clearTimeout(t);
  }, [phase, currentRound, roundChar, config.roundDuration]);

  return (
    <View style={styles.container}>
      {/* Phase accent bar at top */}
      <View style={[styles.accentBar, {backgroundColor: accentColor}]} />

      {/* Main content */}
      <View style={styles.content}>

        {/* Centre block — flex:1 so it fills available space and centres its content */}
        <View style={styles.centerWrapper}>
        {isComplete ? (
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
            <CountdownRing
              secondsRemaining={secondsRemaining}
              totalPhaseDuration={timer.originalPhaseDuration}
              color={Colors.primary}
              label={getPhaseLabel(phase)}
            />
            {totalRounds > 0 && (
              <View style={styles.dotsRow}>
                {Array.from({length: totalRounds}, (_, i) => {
                  const n = i + 1;
                  const isDone = n < currentRound || isComplete;
                  const isCurrent = n === currentRound && !isComplete;
                  return (
                    <View
                      key={n}
                      style={[
                        styles.dot,
                        isDone
                          ? styles.dotDone
                          : isCurrent
                          ? styles.dotCurrent
                          : null,
                      ]}
                    />
                  );
                })}
              </View>
            )}
            {phase === 'prep' && (
              <View style={styles.gifContainer}>
                {showIdleGif ? (
                  <Image
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    source={require('../../assets/idle_base.gif')}
                    style={styles.gifImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    source={require('../../assets/transform_base.gif')}
                    style={styles.gifImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            )}
            {(phase === 'work' || phase === 'rest') && (
              <View style={styles.gifContainer}>
                {showRoundIdleGif ? (
                  <Image
                    source={IDLE_GIFS[roundChar]}
                    style={styles.gifImage}
                    resizeMode="contain"
                  />
                ) : roundChar === 'ssj3' ? (
                  <Video
                    key={currentRound}
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    source={require('../../assets/transform_ssj3.mp4')}
                    style={styles.gifImage}
                    resizeMode={ResizeMode.CONTAIN}
                    repeat={false}
                    paused={false}
                    rate={1}
                    onEnd={() => {
                      if (videoActiveRef.current) setShowRoundIdleGif(true);
                    }}
                  />
                ) : (
                  <Image
                    key={currentRound}
                    source={TRANSFORM_GIFS[roundChar as Exclude<RoundChar, 'ssj3'>]}
                    style={styles.gifImage}
                    resizeMode="contain"
                  />
                )}
              </View>
            )}
          </View>
        )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Primary action: Start / Pause / Resume / Go Again */}
          <TouchableOpacity
            style={[styles.primaryButton, {backgroundColor: primaryButtonBg}]}
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

          {/* Skip — shown during active phases */}
          {!isIdle && !isComplete && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkip}
              activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>SKIP</Text>
            </TouchableOpacity>
          )}

          {/* Reset — shown while a session is active */}
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

          {/* Back to home — shown after reset or on complete */}
          {(isComplete || isIdle) && (
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
    gap: Spacing.lg,
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

  // Idle state (unused — kept for style completeness)
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
  // Prep GIF
  gifContainer: {
    height: 160,
    alignSelf: 'stretch',
    backgroundColor: '#0a1020',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },

  // Round progress dots
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grey800,
    borderWidth: 1,
    borderColor: Colors.grey600,
  },
  dotCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotDone: {
    backgroundColor: Colors.grey400,
    borderColor: Colors.grey400,
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
