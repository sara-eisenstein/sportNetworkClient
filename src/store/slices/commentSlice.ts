import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Comment } from "../../models/comment";
import { getCommentsByPostId, addComment, updateComment, deleteComment } from "../../services/commentService";

interface CommentState {
    comments: Comment[];
    loading: boolean;
    error: string | null;
}

const initialState: CommentState = {
    comments: [],
    loading: false,
    error: null
};

export const fetchComments = createAsyncThunk(
    "comments/fetchByPostId",
    async (postId: number, thunkAPI) => {
        try {
            return await getCommentsByPostId(postId);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to fetch comments");
        }
    }
);

export const createComment = createAsyncThunk(
    "comments/create",
    async (comment: Omit<Comment, "commentId" | "dateCreated" | "userName" | "userProfilePicture">, thunkAPI) => {
        try {
            return await addComment(comment);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to create comment");
        }
    }
);

export const editComment = createAsyncThunk(
    "comments/edit",
    async ({ commentId, content }: { commentId: number; content: string }, thunkAPI) => {
        try {
            return await updateComment(commentId, content);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to update comment");
        }
    }
);

export const removeComment = createAsyncThunk(
    "comments/delete",
    async (commentId: number, thunkAPI) => {
        try {
            await deleteComment(commentId);
            return commentId;
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to delete comment");
        }
    }
);

const commentSlice = createSlice({
    name: "comments",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Comments
            .addCase(fetchComments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
                state.loading = false;
                state.comments = action.payload;
                state.error = null;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Comment
            .addCase(createComment.fulfilled, (state, action: PayloadAction<Comment>) => {
                state.comments.push(action.payload);
                state.error = null;
            })
            .addCase(createComment.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Edit Comment
            .addCase(editComment.fulfilled, (state, action: PayloadAction<Comment>) => {
                const index = state.comments.findIndex(comment => comment.commentId === action.payload.commentId);
                if (index !== -1) {
                    state.comments[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(editComment.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Delete Comment
            .addCase(removeComment.fulfilled, (state, action: PayloadAction<number>) => {
                state.comments = state.comments.filter(comment => comment.commentId !== action.payload);
                state.error = null;
            })
            .addCase(removeComment.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    }
});

export default commentSlice.reducer; 