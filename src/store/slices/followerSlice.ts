import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { FollowerStats } from "../../models/follower";
import { UserDto } from "../../models/user";
import { getFollowers, getFollowing, getFollowerStats, followUser, unfollowUser } from "../../services/followerService";

interface FollowerState {
  followers: UserDto[];
  following: UserDto[];
  stats: FollowerStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: FollowerState = {
  followers: [],
  following: [],
  stats: null,
  loading: false,
  error: null,
};

// מביא את כל העוקבים של משתמש
export const fetchFollowers = createAsyncThunk(
  "follower/fetchFollowers",
  async (userId: number, thunkAPI) => {
    try {
      return await getFollowers(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch followers");
    }
  }
);

// מביא את כל המשתמשים שמשתמש עוקב אחריהם
export const fetchFollowing = createAsyncThunk(
  "follower/fetchFollowing",
  async (userId: number, thunkAPI) => {
    try {
      return await getFollowing(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch following");
    }
  }
);

// מביא סטטיסטיקות של עוקבים
export const fetchFollowerStats = createAsyncThunk(
  "follower/fetchStats",
  async (userId: number, thunkAPI) => {
    try {
      return await getFollowerStats(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch follower stats");
    }
  }
);

// מוסיף עוקב חדש
export const follow = createAsyncThunk(
  "follower/follow",
  async (followedUserId: number, thunkAPI) => {
    try {
      return await followUser(followedUserId);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to follow user");
    }
  }
);

// מסיר עוקב
export const unfollow = createAsyncThunk(
  "follower/unfollow",
  async (followedUserId: number, thunkAPI) => {
    try {
      return await unfollowUser(followedUserId);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to unfollow user");
    }
  }
);

const followerSlice = createSlice({
  name: "follower",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Followers
      .addCase(fetchFollowers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFollowers.fulfilled, (state, action: PayloadAction<UserDto[]>) => {
        state.loading = false;
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Following
      .addCase(fetchFollowing.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFollowing.fulfilled, (state, action: PayloadAction<UserDto[]>) => {
        state.loading = false;
        state.following = action.payload;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Stats
      .addCase(fetchFollowerStats.fulfilled, (state, action: PayloadAction<FollowerStats>) => {
        state.stats = action.payload;
      })
      // Follow User
      .addCase(follow.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(follow.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Unfollow User
      .addCase(unfollow.fulfilled, (state) => {
        state.error = null;
      })
      .addCase(unfollow.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default followerSlice.reducer; 