import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAchievementsByUserId, addAchievement, deleteAchievement } from "../../services/achievementService";
import { Achievement } from "../../models/Achievement";

interface AchievementsState {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
}

const initialState: AchievementsState = {
  achievements: [],
  loading: false,
  error: null,
};

// פעולה אסינכרונית לקבלת הישגים מהשרת
export const fetchAchievements = createAsyncThunk(
  "achievements/fetchAchievements",
  async (userId: number, thunkAPI) => {
    try {
      return await getAchievementsByUserId(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch achievements");
    }
  }
);

// פעולה אסינכרונית להוספת הישג
export const addNewAchievement = createAsyncThunk(
  "achievements/addNewAchievement",
  async (achievement: Achievement, thunkAPI) => {
    try {
      await addAchievement(achievement);
      return achievement; // מחזיר את ההישג שנוסף
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to add achievement");
    }
  }
);

// פעולה אסינכרונית למחיקת הישג
export const removeAchievement = createAsyncThunk(
  "achievements/removeAchievement",
  async (achievementId: number, thunkAPI) => {
    try {
      await deleteAchievement(achievementId);
      return achievementId; // מחזיר את ה-ID שנמחק
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to delete achievement");
    }
  }
);

// Slice לניהול הישגים
const achievementsSlice = createSlice({
  name: "achievements",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAchievements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAchievements.fulfilled, (state, action: PayloadAction<Achievement[]>) => {
        state.loading = false;
        state.achievements = action.payload;
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addNewAchievement.fulfilled, (state, action: PayloadAction<Achievement>) => {
        state.achievements.push(action.payload);
      })
      .addCase(removeAchievement.fulfilled, (state, action: PayloadAction<number>) => {
        state.achievements = state.achievements.filter(a => a.achievementId !== action.payload);
      });
  },
});

export default achievementsSlice.reducer;
