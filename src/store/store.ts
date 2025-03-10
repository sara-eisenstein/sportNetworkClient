import { configureStore } from "@reduxjs/toolkit";
import achievementsReducer from "./slices/achievementsSlice";
import authReducer from "./slices/authSlice";
import followerReducer from "./slices/followerSlice";
import userReducer from "./slices/userSlice";
import commentReducer from "./slices/commentSlice";
import postReducer from "./slices/postSlice";
import challengeReducer from "./slices/challengeSlice";

export const store = configureStore({
  reducer: {
    achievements: achievementsReducer,
    user: userReducer,
    auth: authReducer,
    follower: followerReducer,
    comments: commentReducer,
    posts: postReducer,
    challenges: challengeReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
