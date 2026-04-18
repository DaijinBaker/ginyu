import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SessionConfig} from '../session/sessionSlice';

export interface CompletedSession {
  id: string;
  /** Unix timestamp when session was completed */
  completedAt: number;
  config: SessionConfig;
  /** How many rounds were fully completed */
  roundsCompleted: number;
  /** Total active duration in seconds */
  totalDurationSeconds: number;
}

interface HistoryState {
  sessions: CompletedSession[];
}

const initialState: HistoryState = {
  sessions: [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addSession(state, action: PayloadAction<Omit<CompletedSession, 'id'>>) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      state.sessions.unshift({id, ...action.payload});
    },
    clearHistory(state) {
      state.sessions = [];
    },
    deleteSession(state, action: PayloadAction<string>) {
      state.sessions = state.sessions.filter(s => s.id !== action.payload);
    },
  },
});

export const {addSession, clearHistory, deleteSession} = historySlice.actions;
export default historySlice.reducer;
