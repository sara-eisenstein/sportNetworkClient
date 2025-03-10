import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ChallengeParticipant } from "../../models/challengeParticipant";
import {
    getChallengeParticipants,
    getUserParticipations,
    getParticipationDetails,
    updateParticipantProgress
} from "../../services/challengeParticipantService";

interface ChallengeParticipantState {
    participants: ChallengeParticipant[];
    userParticipations: ChallengeParticipant[];
    selectedParticipant: ChallengeParticipant | null;
    loading: boolean;
    error: string | null;
}

const initialState: ChallengeParticipantState = {
    participants: [],
    userParticipations: [],
    selectedParticipant: null,
    loading: false,
    error: null
};

export const fetchChallengeParticipants = createAsyncThunk(
    "challengeParticipants/fetchAll",
    async (challengeId: number, thunkAPI) => {
        try {
            return await getChallengeParticipants(challengeId);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to fetch challenge participants");
        }
    }
);

export const fetchUserParticipations = createAsyncThunk(
    "challengeParticipants/fetchUserParticipations",
    async (userId: number, thunkAPI) => {
        try {
            return await getUserParticipations(userId);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to fetch user participations");
        }
    }
);

export const fetchParticipationDetails = createAsyncThunk(
    "challengeParticipants/fetchDetails",
    async ({ challengeId, userId }: { challengeId: number; userId: number }, thunkAPI) => {
        try {
            return await getParticipationDetails(challengeId, userId);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to fetch participation details");
        }
    }
);

export const updateProgress = createAsyncThunk(
    "challengeParticipants/updateProgress",
    async (
        { challengeId, userId, progress }: { challengeId: number; userId: number; progress: number },
        thunkAPI
    ) => {
        try {
            return await updateParticipantProgress(challengeId, userId, progress);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to update progress");
        }
    }
);

const challengeParticipantSlice = createSlice({
    name: "challengeParticipants",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Challenge Participants
            .addCase(fetchChallengeParticipants.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchChallengeParticipants.fulfilled, (state, action: PayloadAction<ChallengeParticipant[]>) => {
                state.loading = false;
                state.participants = action.payload;
                state.error = null;
            })
            .addCase(fetchChallengeParticipants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch User Participations
            .addCase(fetchUserParticipations.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserParticipations.fulfilled, (state, action: PayloadAction<ChallengeParticipant[]>) => {
                state.loading = false;
                state.userParticipations = action.payload;
                state.error = null;
            })
            .addCase(fetchUserParticipations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Participation Details
            .addCase(fetchParticipationDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchParticipationDetails.fulfilled, (state, action: PayloadAction<ChallengeParticipant>) => {
                state.loading = false;
                state.selectedParticipant = action.payload;
                state.error = null;
            })
            .addCase(fetchParticipationDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Progress
            .addCase(updateProgress.fulfilled, (state, action: PayloadAction<ChallengeParticipant>) => {
                const index = state.participants.findIndex(
                    p => p.challengeId === action.payload.challengeId && p.userId === action.payload.userId
                );
                if (index !== -1) {
                    state.participants[index] = action.payload;
                }
                const userIndex = state.userParticipations.findIndex(
                    p => p.challengeId === action.payload.challengeId && p.userId === action.payload.userId
                );
                if (userIndex !== -1) {
                    state.userParticipations[userIndex] = action.payload;
                }
                if (state.selectedParticipant?.challengeId === action.payload.challengeId &&
                    state.selectedParticipant?.userId === action.payload.userId) {
                    state.selectedParticipant = action.payload;
                }
                state.error = null;
            })
            .addCase(updateProgress.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    }
});

export default challengeParticipantSlice.reducer; 