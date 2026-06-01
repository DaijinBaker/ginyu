import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {Colors} from '../constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 280;
const STROKE_WIDTH = 16;
const GLOW_STROKE_WIDTH = STROKE_WIDTH + 6;
const RADIUS = (SIZE - GLOW_STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;
// Dot cap at 12 o'clock to cover the arc seam
const DOT_Y = CENTER - RADIUS;

interface Props {
  secondsRemaining: number;
  totalPhaseDuration: number;
  color: string;
  label: string;
}

export default function CountdownRing({
  secondsRemaining,
  totalPhaseDuration,
  color,
  label,
}: Props) {
  const progress =
    totalPhaseDuration > 0 ? secondsRemaining / totalPhaseDuration : 1;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeText = `${minutes}:${String(seconds).padStart(2, '0')}`;

  const glowAnim = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.15,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [glowAnim]);

  return (
    <View style={styles.wrapper}>
      <Svg width={SIZE} height={SIZE}>
        {/* 1. Glow arc — bottom layer, wider, pulsing opacity */}
        <AnimatedCircle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={color}
          strokeWidth={GLOW_STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="butt"
          rotation="-90"
          origin={`${CENTER}, ${CENTER}`}
          opacity={glowAnim}
        />
        {/* 2. Background track — renders over glow bleed, clips the seam */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={Colors.grey800}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* 3. Foreground arc — on top of background track */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="butt"
          rotation="-90"
          origin={`${CENTER}, ${CENTER}`}
        />
        {/* 4. Dot cap at 12 o'clock — background mask then colored cap to cover full glow bleed */}
        <Circle
          cx={CENTER}
          cy={DOT_Y}
          r={GLOW_STROKE_WIDTH / 2 + 1}
          fill={Colors.black}
        />
        <Circle
          cx={CENTER}
          cy={DOT_Y}
          r={STROKE_WIDTH / 2}
          fill={color}
        />
      </Svg>

      {/* Text centred inside the ring */}
      <View style={styles.textWrapper}>
        <Text style={[styles.label, {color}]}>{label}</Text>
        <Text style={styles.time}>{timeText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  time: {
    fontSize: 72,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -2,
    lineHeight: 80,
  },
});
