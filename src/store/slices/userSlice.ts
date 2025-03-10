import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getUsers, getUserById } from "../../services/userService";
import { UserDto } from "../../models/user";

interface UserState {
  users: UserDto[];
  selectedUser: UserDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
};

// מביא את כל המשתמשים
export const fetchUsers = createAsyncThunk("user/fetchUsers", async (_, thunkAPI) => {
  try {
    return await getUsers();
  } catch (error) {
    return thunkAPI.rejectWithValue("Failed to fetch users");
  }
});

// מביא משתמש לפי ID
export const fetchUserById = createAsyncThunk("user/fetchUserById", async (id: number, thunkAPI) => {
  try {
    return await getUserById(id);
  } catch (error) {
    return thunkAPI.rejectWithValue("Failed to fetch user");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<UserDto[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<UserDto>) => {
        state.selectedUser = action.payload;
      });
  },
});

export default userSlice.reducer;
