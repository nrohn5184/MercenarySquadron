import { configureStore } from '@reduxjs/toolkit';
import squadronReducer from './squadronSlice';

export const store = configureStore({
  reducer: {
    squadron: squadronReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 