import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Challenge } from "../../models/challenge";
import {
    getAllChallenges,
    getUserChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    joinChallenge,
    leaveChallenge,
    updateProgress
} from "../../services/challengeService";

interface ChallengeState {
    challenges: Challenge[];
    userChallenges: Challenge[];
    selectedChallenge: Challenge | null;
    loading: boolean;
    error: string | null;
}

const initialState: ChallengeState = {
    challenges: [],
    userChallenges: [],
    selectedChallenge: null,
    loading: false,
    error: null
};

export const fetchAllChallenges = createAsyncThunk(
    "challenges/fetchAll",
    async (_, thunkAPI) => {
        try {
            return await getAllChallenges();
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to fetch challenges");
        }
    }
);

export const fetchUserChallenges = createAsyncThunk(
    "challenges/fetchUserChallenges",
    async (userId: number, thunkAPI) => {
        try {
            return await getUserChallenges(userId);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to fetch user challenges");
        }
    }
);

export const addChallenge = createAsyncThunk(
    "challenges/create",
    async (challengeData: {
        Title: string;
        Description: string;
        Level: number;
        StartDate: string;
        EndDate: string;
    }, thunkAPI) => {
        try {
            return await createChallenge(challengeData);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to create challenge");
        }
    }
);

export const editChallenge = createAsyncThunk(
    "challenges/edit",
    async ({ challengeId, challengeData }: { challengeId: number; challengeData: Partial<Challenge> }, thunkAPI) => {
        try {
            return await updateChallenge(challengeId, challengeData);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to update challenge");
        }
    }
);

export const removeChallenge = createAsyncThunk(
    "challenges/delete",
    async (challengeId: number, thunkAPI) => {
        try {
            await deleteChallenge(challengeId);
            return challengeId;
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to delete challenge");
        }
    }
);

export const participateInChallenge = createAsyncThunk(
    "challenges/join",
    async (challengeId: number, thunkAPI) => {
        try {
            await joinChallenge(challengeId);
            return challengeId;
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to join challenge");
        }
    }
);

export const quitChallenge = createAsyncThunk(
    "challenges/leave",
    async (challengeId: number, thunkAPI) => {
        try {
            await leaveChallenge(challengeId);
            return challengeId;
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to leave challenge");
        }
    }
);

export const updateChallengeProgress = createAsyncThunk(
    "challenges/updateProgress",
    async ({ challengeId, progress }: { challengeId: number; progress: number }, thunkAPI) => {
        try {
            return await updateProgress(challengeId, progress);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to update progress");
        }
    }
);

const challengeSlice = createSlice({
    name: "challenges",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All Challenges
            .addCase(fetchAllChallenges.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllChallenges.fulfilled, (state, action: PayloadAction<Challenge[]>) => {
                state.loading = false;
                state.challenges = action.payload;
                state.error = null;
            })
            .addCase(fetchAllChallenges.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch User Challenges
            .addCase(fetchUserChallenges.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserChallenges.fulfilled, (state, action: PayloadAction<Challenge[]>) => {
                state.loading = false;
                state.userChallenges = action.payload;
                state.error = null;
            })
            .addCase(fetchUserChallenges.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Challenge
            .addCase(addChallenge.fulfilled, (state, action: PayloadAction<Challenge>) => {
                state.challenges.unshift(action.payload);
                state.error = null;
            })
            .addCase(addChallenge.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Edit Challenge
            .addCase(editChallenge.fulfilled, (state, action: PayloadAction<Challenge>) => {
                const index = state.challenges.findIndex(challenge => challenge.challengeId === action.payload.challengeId);
                if (index !== -1) {
                    state.challenges[index] = action.payload;
                }
                const userIndex = state.userChallenges.findIndex(challenge => challenge.challengeId === action.payload.challengeId);
                if (userIndex !== -1) {
                    state.userChallenges[userIndex] = action.payload;
                }
                state.error = null;
            })
            .addCase(editChallenge.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Delete Challenge
            .addCase(removeChallenge.fulfilled, (state, action: PayloadAction<number>) => {
                state.challenges = state.challenges.filter(challenge => challenge.challengeId !== action.payload);
                state.userChallenges = state.userChallenges.filter(challenge => challenge.challengeId !== action.payload);
                state.error = null;
            })
            .addCase(removeChallenge.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Join Challenge
            .addCase(participateInChallenge.fulfilled, (state, action: PayloadAction<number>) => {
                const challenge = state.challenges.find(c => c.challengeId === action.payload);
                if (challenge) {
                    challenge.isParticipating = true;
                    challenge.participantsCount++;
                }
                state.error = null;
            })
            .addCase(participateInChallenge.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Leave Challenge
            .addCase(quitChallenge.fulfilled, (state, action: PayloadAction<number>) => {
                const challenge = state.challenges.find(c => c.challengeId === action.payload);
                if (challenge) {
                    challenge.isParticipating = false;
                    challenge.participantsCount--;
                }
                state.error = null;
            })
            .addCase(quitChallenge.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Update Progress
            .addCase(updateChallengeProgress.fulfilled, (state, action: PayloadAction<Challenge>) => {
                const challenge = state.challenges.find(c => c.challengeId === action.payload.challengeId);
                if (challenge) {
                    challenge.currentProgress = action.payload.currentProgress;
                    challenge.status = action.payload.status;
                }
                const userChallenge = state.userChallenges.find(c => c.challengeId === action.payload.challengeId);
                if (userChallenge) {
                    userChallenge.currentProgress = action.payload.currentProgress;
                    userChallenge.status = action.payload.status;
                }
                state.error = null;
            })
            .addCase(updateChallengeProgress.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    }
});

export default challengeSlice.reducer; 