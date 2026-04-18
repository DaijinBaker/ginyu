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
}

const initialState: TimerState = {
  phase: 'idle',
  secondsRemaining: 0,
  currentRound: 0,
  totalRounds: 0,
  isRunning: false,
  phaseStartedAt: null,
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    /** Load session config and transition to prep phase */
    startSession(state, action: PayloadAction<SessionConfig>) {
      const {prepDuration, rounds} = action.payload;
      state.phase = 'prep';
      state.secondsRemaining = prepDuration;
      state.currentRound = 0;
      state.totalRounds = rounds;
      state.isRunning = true;
      state.phaseStartedAt = Date.now();
    },
    tick(state) {
      if (!state.isRunning || state.secondsRemaining <= 0) return;
      state.secondsRemaining -= 1;
    },
    /** Advance to the next phase — called when secondsRemaining reaches 0 */
    advancePhase(state, action: PayloadAction<SessionConfig>) {
      const {roundDuration, restDuration, rounds} = action.payload;

      switch (state.phase) {
        case 'prep':
          state.phase = 'work';
          state.currentRound = 1;
          state.secondsRemaining = roundDuration;
          break;
        case 'work':
          if (state.currentRound >= rounds) {
            state.phase = 'complete';
            state.isRunning = false;
            state.secondsRemaining = 0;
          } else {
            state.phase = 'rest';
            state.secondsRemaining = restDuration;
          }
          break;
        case 'rest':
          state.phase = 'work';
          state.currentRound += 1;
          state.secondsRemaining = roundDuration;
          break;
        default:
          break;
      }
      state.phaseStartedAt = Date.now();
    },
    pause(state) {
      state.isRunning = false;
    },
    resume(state) {
      if (state.phase !== 'idle' && state.phase !== 'complete') {
        state.isRunning = true;
        state.phaseStartedAt = Date.now();
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
