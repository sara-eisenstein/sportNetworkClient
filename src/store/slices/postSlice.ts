import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Post } from "../../models/post";
import { 
    getAllPosts, 
    getPostsByUserId, 
    createPost as createPostService, 
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

export const addNewPost = createAsyncThunk<Post, FormData>(
    'posts/createPost',
    async (postData: FormData, { dispatch }) => {
        console.log('🔄 postSlice: Creating new post');
        const response = await createPostService(postData);
        console.log('✅ postSlice: Post created successfully:', response);
        
        // רענון רשימת הפוסטים לאחר יצירת פוסט חדש
        dispatch(fetchAllPosts());
        
        return response;
    }
);

export const editPost = createAsyncThunk(
    "posts/edit",
    async ({ postId, postData }: { postId: number; postData: FormData }, { dispatch }) => {
        try {
            console.log('🔄 postSlice: Editing post:', postId);
            const response = await updatePost(postId, postData);
            console.log('✅ postSlice: Post edited successfully:', response);
            
            // רענון רשימת הפוסטים לאחר עריכת פוסט
            dispatch(fetchAllPosts());
            
            return response;
        } catch (error) {
            console.error('❌ postSlice: Failed to edit post:', error);
            throw error;
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
            .addCase(addNewPost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addNewPost.fulfilled, (state, action) => {
                state.loading = false;
                // הוספת הפוסט החדש לתחילת הרשימה
                if (action.payload && action.payload.postId) {
                    // בדיקה שהפוסט לא קיים כבר ברשימה
                    const exists = state.posts.some(post => post.postId === action.payload.postId);
                    if (!exists) {
                        state.posts = [action.payload, ...state.posts];
                    }
                }
            })
            .addCase(addNewPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create post';
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
                    // טיפול במקרה שבו likesCount הוא undefined
                    post.likesCount = (post.likesCount || 0) + (isLiked ? 1 : -1);
                    // וידוא שמספר הלייקים לא יורד מתחת ל-0
                    if (post.likesCount < 0) post.likesCount = 0;
                }
                
                // עדכון הפוסט ברשימת הפוסטים של המשתמש
                const userPost = state.userPosts.find(p => p.postId === postId);
                if (userPost) {
                    userPost.isLiked = isLiked;
                    // טיפול במקרה שבו likesCount הוא undefined
                    userPost.likesCount = (userPost.likesCount || 0) + (isLiked ? 1 : -1);
                    // וידוא שמספר הלייקים לא יורד מתחת ל-0
                    if (userPost.likesCount < 0) userPost.likesCount = 0;
                }
                
                state.error = null;
            })
            .addCase(toggleLike.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    }
});

export default postSlice.reducer; 