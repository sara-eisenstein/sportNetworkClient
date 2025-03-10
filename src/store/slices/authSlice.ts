import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { loginUser, logoutUser, getToken, AuthResponse } from "../../services/authService";
import { UserDto } from "../../models/user";

// מבנה הנתונים של סטייט המשתמשים
interface AuthState {
  token: string | null;
  loading: boolean;
  error: string | null;
  currentUser: UserDto | null;
}

// סטייט ראשוני
const initialState: AuthState = {
  token: getToken(),
  loading: false,
  error: null,
  currentUser: null,
};

// פעולה אסינכרונית להתחברות
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      const response: AuthResponse = await loginUser(email, password);
      return response.token;
    } catch (error) {
      return thunkAPI.rejectWithValue("Login failed. Please check your credentials.");
    }
  }
);

// Slice לניהול התחברות
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      logoutUser();
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.token = action.payload;
        // You'll need to fetch the current user here or in a separate thunk
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ייצוא הפעולות
export const { logout } = authSlice.actions;
export default authSlice.reducer;
