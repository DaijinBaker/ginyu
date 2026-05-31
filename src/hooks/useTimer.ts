import {useEffect, useRef} from 'react';
import {useAppDispatch, useAppSelector} from './useAppStore';
import {
  tick,
  advancePhase,
  startSession,
  pause,
  resume,
  reset,
} from '../features/timer/timerSlice';
import type {SessionConfig} from '../features/session/sessionSlice';
import {useSound} from './useSound';
import type {TimerPhase} from '../features/timer/timerSlice';

/**
 * useTimer — drives the countdown engine and exposes controls to the UI.
 *
 * Interval management:
 *   - A setInterval fires every 1 second while isRunning is true.
 *   - Each tick decrements secondsRemaining in the Redux store.
 *   - A separate effect watches secondsRemaining: when it hits 0, advancePhase
 *     is dispatched to transition prep→work, work→rest, rest→work, or work→complete.
 *
 * Stale closure safety:
 *   - configRef keeps a live reference to the session config so the phase-
 *     advance effect never captures a stale value across re-renders.
 */
export function useTimer() {
  const dispatch = useAppDispatch();
  const timer = useAppSelector(state => state.timer);
  const config = useAppSelector(state => state.session.config);
  const {playBeep, playStart, playBell} = useSound();

  // Keep a ref to config so effects always see the latest value
  const configRef = useRef<SessionConfig>(config);
  configRef.current = config;

  // Track previous phase and secondsRemaining for sound triggers
  const prevPhaseRef = useRef<TimerPhase>(timer.phase);
  const prevSecondsRef = useRef<number>(timer.secondsRemaining);

  // ── Countdown interval ────────────────────────────────────────────────────
  useEffect(() => {
    if (!timer.isRunning) return;

    const interval = setInterval(() => {
      dispatch(tick(Date.now()));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer.isRunning, dispatch]);

  // ── Phase advancement ─────────────────────────────────────────────────────
  // When secondsRemaining reaches 0 (and we're in an active phase), move on.
  useEffect(() => {
    if (
      timer.secondsRemaining === 0 &&
      timer.isRunning &&
      timer.phase !== 'idle' &&
      timer.phase !== 'complete'
    ) {
      dispatch(advancePhase({...configRef.current, now: Date.now()}));
    }
  }, [timer.secondsRemaining, timer.isRunning, timer.phase, dispatch]);

  // ── Sound & haptic triggers ───────────────────────────────────────────────
  useEffect(() => {
    const phase = timer.phase;
    const secs = timer.secondsRemaining;
    const prevPhase = prevPhaseRef.current;
    const prevSecs = prevSecondsRef.current;

    // Phase transition sounds (fire when phase changes)
    if (phase !== prevPhase) {
      if (phase === 'work' || phase === 'rest') {
        // Entering work from prep: start tone
        // Entering work from rest or rest from work: bell then start
        if (prevPhase === 'rest' || prevPhase === 'work') {
          playBell();
          // Slight delay so bell plays first then start tone on next tick
        } else {
          playStart();
        }
      } else if (phase === 'complete') {
        playBell();
      }
    }

    // Tick beep: last 3 seconds of prep phase
    if (phase === 'prep' && secs > 0 && secs <= 3 && secs !== prevSecs) {
      playBeep();
    }

    // Tick beep: warning countdown in work phase
    if (
      phase === 'work' &&
      secs > 0 &&
      secs <= configRef.current.warningTime &&
      secs !== prevSecs
    ) {
      playBeep();
    }

    prevPhaseRef.current = phase;
    prevSecondsRef.current = secs;
  }, [timer.phase, timer.secondsRemaining, playBeep, playStart, playBell]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handleStart = () => dispatch(startSession({...configRef.current, now: Date.now()}));
  const handlePause = () => dispatch(pause());
  const handleResume = () => dispatch(resume(Date.now()));
  const handleReset = () => dispatch(reset());
  const handleSkip = () => dispatch(advancePhase({...configRef.current, now: Date.now()}));

  const handleToggleRunning = () => {
    if (timer.phase === 'idle' || timer.phase === 'complete') {
      handleStart();
    } else if (timer.isRunning) {
      handlePause();
    } else {
      handleResume();
    }
  };

  return {
    timer,
    config,
    handleStart,
    handlePause,
    handleResume,
    handleReset,
    handleSkip,
    handleToggleRunning,
  };
}
