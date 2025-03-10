import { configureStore } from "@reduxjs/toolkit";
import achievementsReducer from "./slices/achievementsSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    achievements: achievementsReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
