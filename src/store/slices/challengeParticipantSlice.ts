import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ChallengeParticipant } from "../../models/challengeParticipant";
import {
    getChallengeParticipants,
    getUserParticipations,
    getParticipationDetails,
    updateParticipantProgress
} from "../../services/challengeParticipantService";

interface ChallengeParticipantState {
    participantsByChallenge: {
        [challengeId: number]: ChallengeParticipant[];
    };
    userParticipations: ChallengeParticipant[];
    selectedParticipant: ChallengeParticipant | null;
    loading: boolean;
    error: string | null;
}

const initialState: ChallengeParticipantState = {
    participantsByChallenge: {},
    userParticipations: [],
    selectedParticipant: null,
    loading: false,
    error: null
};

export const fetchChallengeParticipants = createAsyncThunk(
    "challengeParticipants/fetchAll",
    async (challengeId: number, thunkAPI) => {
        try {
            const participants = await getChallengeParticipants(challengeId);
            return { challengeId, participants };
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
        { challengeId, userId, progress }: { challengeId: number; userId: number; progress: string },
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
            .addCase(fetchChallengeParticipants.fulfilled, (state, action: PayloadAction<{challengeId: number, participants: ChallengeParticipant[]}>) => {
                state.loading = false;
                state.participantsByChallenge[action.payload.challengeId] = action.payload.participants;
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
            // Update selected participant
            .addCase(updateProgress.fulfilled, (state, action: PayloadAction<ChallengeParticipant>) => {
                const challengeId = action.payload.challengeId;
                const participants = state.participantsByChallenge[challengeId];
                
                if (participants) {
                    const index = participants.findIndex(p => p.userId === action.payload.userId);
                    if (index !== -1) {
                        state.participantsByChallenge[challengeId][index] = action.payload;
                    }
                }

                const userIndex = state.userParticipations.findIndex(
                    p => p.userId === action.payload.userId
                );
                if (userIndex !== -1) {
                    state.userParticipations[userIndex] = action.payload;
                }
                if (state.selectedParticipant?.userId === action.payload.userId) {
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