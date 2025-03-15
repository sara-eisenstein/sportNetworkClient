import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "../../models/post";
import { 
    getAllPosts, 
    getPostsByUserId, 
    createPost, 
    updatePost, 
    deletePost,
    likePost,
    unlikePost
} from "../../services/postService";



interface PostState {
    posts: Post[];
    userPosts: Post[];
    selectedPost: Post | null;
    loading: boolean;
    error: string | null;
}

const initialState: PostState = {
    posts: [],
    userPosts: [],
    selectedPost: null,
    loading: false,
    error: null
};

export const fetchAllPosts = createAsyncThunk(
    "posts/fetchAll",
    async (_, thunkAPI) => {
        try {
            return await getAllPosts();
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to fetch posts");
        }
    }
);

export const fetchUserPosts = createAsyncThunk(
    "posts/fetchUserPosts",
    async (userId: number, thunkAPI) => {
        try {
            return await getPostsByUserId(userId);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to fetch user posts");
        }
    }
);

export const addPost = createAsyncThunk(
    "posts/create",
    async (postData: FormData, thunkAPI) => {
        try {
            return await createPost(postData);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to create post");
        }
    }
);

export const editPost = createAsyncThunk(
    "posts/edit",
    async ({ postId, postData }: { postId: number; postData: FormData }, thunkAPI) => {
        try {
            return await updatePost(postId, postData);
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to update post");
        }
    }
);

export const removePost = createAsyncThunk(
    "posts/delete",
    async (postId: number, thunkAPI) => {
        try {
            await deletePost(postId);
            return postId;
        } catch (error) {
            return thunkAPI.rejectWithValue("Failed to delete post");
        }
    }
);

export const toggleLike = createAsyncThunk(
    'posts/toggleLike',
    async ({ postId, userId, isLiked }: { postId: number; userId: number; isLiked: boolean }) => {
        try {
            console.log('🔄 Sending like request to server:', { postId, userId, isLiked });
            
            if (isLiked) {
                await likePost(postId, userId);
                console.log('✅ Like added successfully');
            } else {
                await unlikePost(postId, userId);
                console.log('✅ Like removed successfully');
            }

            // החזרת האובייקט עם המידע העדכני
            return { postId, userId, isLiked };
        } catch (error) {
            console.error('❌ Failed to toggle like on server:', error);
            throw error;
        }
    }
);

const postSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch All Posts
            .addCase(fetchAllPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
                state.loading = false;
                state.posts = action.payload;
                state.error = null;
            })
            .addCase(fetchAllPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch User Posts
            .addCase(fetchUserPosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
                state.loading = false;
                state.userPosts = action.payload;
                state.error = null;
            })
            .addCase(fetchUserPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Post
            .addCase(addPost.fulfilled, (state, action: PayloadAction<Post>) => {
                state.posts.unshift(action.payload);
                state.error = null;
            })
            .addCase(addPost.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Edit Post
            .addCase(editPost.fulfilled, (state, action: PayloadAction<Post>) => {
                const index = state.posts.findIndex(post => post.postId === action.payload.postId);
                if (index !== -1) {
                    state.posts[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(editPost.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Delete Post
            .addCase(removePost.fulfilled, (state, action: PayloadAction<number>) => {
                state.posts = state.posts.filter(post => post.postId !== action.payload);
                state.userPosts = state.userPosts.filter(post => post.postId !== action.payload);
                state.error = null;
            })
            .addCase(removePost.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Toggle Like
            .addCase(toggleLike.fulfilled, (state, action: PayloadAction<{ postId: number; isLiked: boolean }>) => {
                const { postId, isLiked } = action.payload;
                const post = state.posts.find(p => p.postId === postId);
                if (post) {
                    post.isLiked = isLiked;
                    post.likesCount += isLiked ? 1 : -1;
                }
                const userPost = state.userPosts.find(p => p.postId === postId);
                if (userPost) {
                    userPost.isLiked = isLiked;
                    userPost.likesCount += isLiked ? 1 : -1;
                }
                state.error = null;
            })
            .addCase(toggleLike.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    }
});

export default postSlice.reducer; 