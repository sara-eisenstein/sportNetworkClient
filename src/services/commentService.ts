import axios from "axios";
import { Comment } from "../models/comment";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * מביא את כל התגובות של פוסט מסוים
 */
export const getCommentsByPostId = async (postId: number): Promise<Comment[]> => {
    const token = localStorage.getItem("token");
    console.log(`🔄 Fetching comments for post ${postId}`);
    console.log(`Token exists: ${!!token}`);
    
    try {
        const response = await axios.get<Comment[]>(`${API_URL}/api/Comment/post/${postId}/comments`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        // Sort comments by date, newest first
        const sortedComments = response.data.sort((a, b) => 
            new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        );
        console.log(`✅ Comments fetched and sorted successfully:`, sortedComments);
        return sortedComments;
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.log(`ℹ️ No comments found for post ${postId}`);
            return [];
        }
        console.error(`❌ Failed to fetch comments for post ${postId}:`, {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url
        });
        throw error;
    }
};

/**
 * הוספת תגובה חדשה
 */
export const addComment = async (comment: Omit<Comment, "commentId" | "createdDate" | "userName" | "userProfilePicture">): Promise<Comment> => {
    const token = localStorage.getItem("token");
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    
    const formData = new FormData();
    formData.append('CommentId', '');
    formData.append('PostId', comment.postId.toString());
    formData.append('UserId', comment.userId.toString());
    formData.append('Content', comment.content);
    formData.append('CreatedDate', formattedDate);
    
    console.log('🔄 Sending new comment:', {
        PostId: comment.postId,
        UserId: comment.userId,
        Content: comment.content,
        CreatedDate: formattedDate
    });
    
    try {
        const response = await axios.post<Comment>(`${API_URL}/api/Comment`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
        });
        console.log('✅ Comment created successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to create comment:', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            requestData: {
                PostId: comment.postId,
                UserId: comment.userId,
                Content: comment.content,
                CreatedDate: formattedDate
            }
        });
        throw error;
    }
};

/**
 * עדכון תגובה קיימת
 */
export const updateComment = async (commentId: number, formData: FormData): Promise<Comment> => {
    const token = localStorage.getItem("token");
    const response = await axios.put<Comment>(`${API_URL}/api/Comment/${commentId}`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        },
    });
    return response.data;
};

/**
 * מחיקת תגובה
 */
export const deleteComment = async (commentId: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/Comment/${commentId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};
