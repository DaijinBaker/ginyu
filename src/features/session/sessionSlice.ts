import {createSlice, PayloadAction} from '@reduxjs/toolkit';

/**
 * Session configuration — the settings the user defines before starting a
 * workout. Stored separately from active timer state so they persist between
 * sessions and can be edited without interrupting a running timer.
 */
export interface SessionConfig {
  /** Duration of each work round in seconds */
  roundDuration: number;
  /** Duration of each rest period in seconds */
  restDuration: number;
  /** Total number of rounds */
  rounds: number;
  /** Preparation countdown before first round begins, in seconds */
  prepDuration: number;
  /** How many seconds before end of a round to trigger the warning signal */
  warningTime: number;
}

interface SessionState {
  config: SessionConfig;
}

const initialState: SessionState = {
  config: {
    roundDuration: 180, // 3 minutes
    restDuration: 60, // 1 minute
    rounds: 8,
    prepDuration: 10,
    warningTime: 10,
  },
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    updateConfig(state, action: PayloadAction<Partial<SessionConfig>>) {
      state.config = {...state.config, ...action.payload};
    },
    resetConfig(state) {
      state.config = initialState.config;
    },
  },
});

export const {updateConfig, resetConfig} = sessionSlice.actions;
export default sessionSlice.reducer;
