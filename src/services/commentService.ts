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
        const response = await axios.get<Comment[]>(`${API_URL}/api/Comment/GetByPostId/${postId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(`✅ Comments fetched successfully:`, response.data);
        return response.data;
    } catch (error: any) {
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
export const addComment = async (comment: Omit<Comment, "commentId" | "dateCreated" | "userName" | "userProfilePicture">): Promise<Comment> => {
    const response = await axios.post<Comment>(`${API_URL}/api/Comment`, comment, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
};

/**
 * עדכון תגובה קיימת
 */
export const updateComment = async (commentId: number, content: string): Promise<Comment> => {
    const response = await axios.put<Comment>(`${API_URL}/api/Comment/${commentId}`, { content }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
