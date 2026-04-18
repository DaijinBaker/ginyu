import {configureStore} from '@reduxjs/toolkit';
import timerReducer from '../features/timer/timerSlice';
import sessionReducer from '../features/session/sessionSlice';
import historyReducer from '../features/history/historySlice';

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    session: sessionReducer,
    history: historyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
