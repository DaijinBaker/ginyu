import React, {useEffect, useRef, useState} from 'react';
import {Alert, BackHandler, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {activateKeepAwake, deactivateKeepAwake} from '@sayem314/react-native-keep-awake';
import Video, {ResizeMode} from 'react-native-video';
import {useNavigation} from '@react-navigation/native';
import {Colors, Spacing, Typography} from '../constants';
import {useTimer} from '../hooks/useTimer';
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
      return 'POWER UP';
    case 'work':
      return 'FIGHT!';
    case 'rest':
      return 'RECOVER';
    case 'complete':
      return 'VICTORY!';
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

  // Keep screen awake while a session is active; release when idle or complete
  useEffect(() => {
    if (isRunning) {
      activateKeepAwake();
    } else {
      deactivateKeepAwake();
    }
    return () => deactivateKeepAwake();
  }, [isRunning]);

  // Intercept Android hardware back button during an active session
  useEffect(() => {
    if (isIdle || isComplete) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'End session?',
        'Going back will reset the timer.',
        [
          {text: 'Stay', style: 'cancel'},
          {
            text: 'End session',
            style: 'destructive',
            onPress: () => {
              handleReset();
              navigation.goBack();
            },
          },
        ],
      );
      return true; // prevent default back behaviour
    });
    return () => sub.remove();
  }, [isIdle, isComplete, handleReset, navigation]);

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
  // SSJ3 video: rate is calculated once onLoad fires, scaled so video ends ~2s before round
  const [ssj3VideoRate, setSsj3VideoRate] = useState(1);
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
    setSsj3VideoRate(1); // reset rate; onLoad will recalculate for this round
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
      {/* Full-screen victory background */}
      {isComplete && (
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('../../assets/EndSession.jpeg')}
          style={styles.fullScreenImage}
          resizeMode="cover"
        />
      )}

      {/* Phase accent bar at top */}
      <View style={[styles.accentBar, {backgroundColor: accentColor}]} />

      {/* Main content */}
      <View style={styles.content}>

        {/* Centre block — flex:1 so it fills available space and centres its content */}
        <View style={styles.centerWrapper}>
        {isComplete ? (
          <View style={styles.completeContainer}>
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
              color={accentColor}
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
                {/* Idle is always-visible base layer in normal flow */}
                <Image
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  source={require('../../assets/idle_base.gif')}
                  style={styles.gifImage}
                  resizeMode="contain"
                />
                {/* Transform sits on top (absoluteFill, rendered last = Fresco top layer) */}
                <Image
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  source={require('../../assets/transform_base.gif')}
                  style={[styles.gifImageAbsolute, {opacity: showIdleGif ? 0 : 1}]}
                  resizeMode="contain"
                />
              </View>
            )}
            {(phase === 'work' || phase === 'rest') && (
              <View style={styles.gifContainer}>
                {/* Idle is always-visible base layer in normal flow */}
                <Image
                  source={IDLE_GIFS[roundChar]}
                  style={styles.gifImage}
                  resizeMode="contain"
                />
                {/* Transform sits on top (absoluteFill, rendered last = Fresco top layer) */}
                {roundChar === 'ssj3' ? (
                  <Video
                    key={currentRound}
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    source={require('../../assets/transform_ssj3.mp4')}
                    style={[styles.gifImageAbsolute, {opacity: showRoundIdleGif ? 0 : 1}]}
                    resizeMode={ResizeMode.CONTAIN}
                    repeat={false}
                    paused={false}
                    rate={ssj3VideoRate}
                    onLoad={({duration}: {duration: number}) => {
                      if (duration > 0 && config.roundDuration > 2) {
                        const targetSecs = config.roundDuration - 2;
                        const computed = duration / targetSecs;
                        setSsj3VideoRate(Math.max(1, Math.min(3, computed)));
                      }
                    }}
                    onEnd={() => {
                      if (videoActiveRef.current) setShowRoundIdleGif(true);
                    }}
                  />
                ) : (
                  <Image
                    key={currentRound}
                    source={TRANSFORM_GIFS[roundChar as Exclude<RoundChar, 'ssj3'>]}
                    style={[styles.gifImageAbsolute, {opacity: showRoundIdleGif ? 0 : 1}]}
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
                ? 'FIGHT!'
                : isComplete
                ? 'REMATCH!'
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

  // Complete state
  fullScreenImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  completeContainer: {
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: 'rgba(8, 20, 40, 0.65)',
    borderRadius: 16,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
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
  gifImageAbsolute: {
    position: 'absolute',
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
    backgroundColor: 'rgba(8, 20, 40, 0.75)',
  },
  secondaryButtonText: {
    ...Typography.label,
    letterSpacing: 3,
    color: Colors.grey400,
  },
});
