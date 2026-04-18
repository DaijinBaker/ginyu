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

  // Keep a ref to config so effects always see the latest value
  const configRef = useRef<SessionConfig>(config);
  configRef.current = config;

  // ── Countdown interval ────────────────────────────────────────────────────
  useEffect(() => {
    if (!timer.isRunning) return;

    const interval = setInterval(() => {
      dispatch(tick());
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
      dispatch(advancePhase(configRef.current));
    }
  }, [timer.secondsRemaining, timer.isRunning, timer.phase, dispatch]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const handleStart = () => dispatch(startSession(configRef.current));
  const handlePause = () => dispatch(pause());
  const handleResume = () => dispatch(resume());
  const handleReset = () => dispatch(reset());

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
    handleToggleRunning,
  };
}
