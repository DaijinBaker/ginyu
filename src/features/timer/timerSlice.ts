import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SessionConfig} from '../session/sessionSlice';

export type TimerPhase = 'idle' | 'prep' | 'work' | 'rest' | 'complete';

export interface TimerState {
  /** Current phase of the workout */
  phase: TimerPhase;
  /** Seconds remaining in the current phase */
  secondsRemaining: number;
  /** Which round is currently active (1-based) */
  currentRound: number;
  /** Total rounds for this session (snapshot from config when started) */
  totalRounds: number;
  /** Whether the timer is actively counting down */
  isRunning: boolean;
  /** Unix timestamp (ms) when the current phase started, used for drift correction */
  phaseStartedAt: number | null;
  /** Total duration in seconds of the current phase, used for drift correction */
  totalPhaseDuration: number;
  /** Full duration of the current phase at the moment it began — never mutated on pause/resume */
  originalPhaseDuration: number;
}

const initialState: TimerState = {
  phase: 'idle',
  secondsRemaining: 0,
  currentRound: 0,
  totalRounds: 0,
  isRunning: false,
  phaseStartedAt: null,
  totalPhaseDuration: 0,
  originalPhaseDuration: 0,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    /** Load session config and transition to prep phase */
    startSession(state, action: PayloadAction<SessionConfig & {now: number}>) {
      const {prepDuration, rounds, now} = action.payload;
      state.phase = 'prep';
      state.secondsRemaining = prepDuration;
      state.totalPhaseDuration = prepDuration;
      state.originalPhaseDuration = prepDuration;
      state.currentRound = 0;
      state.totalRounds = rounds;
      state.isRunning = true;
      state.phaseStartedAt = now;
    },
    tick(state, action: PayloadAction<number>) {
      if (!state.isRunning || state.phaseStartedAt === null) return;
      const elapsed = Math.floor((action.payload - state.phaseStartedAt) / 1000);
      state.secondsRemaining = Math.max(0, state.totalPhaseDuration - elapsed);
    },
    /** Advance to the next phase — called when secondsRemaining reaches 0 */
    advancePhase(state, action: PayloadAction<SessionConfig & {now: number}>) {
      const {roundDuration, restDuration, rounds, now} = action.payload;

      switch (state.phase) {
        case 'prep':
          state.phase = 'work';
          state.currentRound = 1;
          state.secondsRemaining = roundDuration;
          state.totalPhaseDuration = roundDuration;
          state.originalPhaseDuration = roundDuration;
          break;
        case 'work':
          if (state.currentRound >= rounds) {
            state.phase = 'complete';
            state.isRunning = false;
            state.secondsRemaining = 0;
            state.totalPhaseDuration = 0;
            state.originalPhaseDuration = 0;
          } else {
            state.phase = 'rest';
            state.secondsRemaining = restDuration;
            state.totalPhaseDuration = restDuration;
            state.originalPhaseDuration = restDuration;
          }
          break;
        case 'rest':
          state.phase = 'work';
          state.currentRound += 1;
          state.secondsRemaining = roundDuration;
          state.totalPhaseDuration = roundDuration;
          state.originalPhaseDuration = roundDuration;
          break;
        default:
          break;
      }
      if (state.phase !== 'complete') {
        state.phaseStartedAt = now;
      }
    },
    pause(state) {
      state.isRunning = false;
    },
    resume(state, action: PayloadAction<number>) {
      if (state.phase !== 'idle' && state.phase !== 'complete') {
        state.isRunning = true;
        state.phaseStartedAt = action.payload;
        state.totalPhaseDuration = state.secondsRemaining;
      }
    },
    reset() {
      return initialState;
    },
  },
});

export const {startSession, tick, advancePhase, pause, resume, reset} =
  timerSlice.actions;
export default timerSlice.reducer;
