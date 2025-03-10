import axios from "axios";
import { Post } from "../models/post";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * מביא את כל הפוסטים
 */
export const getAllPosts = async (): Promise<Post[]> => {
    const response = await axios.get<Post[]>(`${API_URL}/api/Post`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
};

/**
 * מביא פוסטים של משתמש מסוים
 */
export const getPostsByUserId = async (userId: number): Promise<Post[]> => {
    const response = await axios.get<Post[]>(`${API_URL}/api/Post/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
};

/**
 * מביא פוסט לפי מזהה
 */
export const getPostById = async (postId: number): Promise<Post> => {
    const response = await axios.get<Post>(`${API_URL}/api/Post/${postId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
};

/**
 * יצירת פוסט חדש
 */
export const createPost = async (postData: FormData): Promise<Post> => {
    const response = await axios.post<Post>(`${API_URL}/api/Post`, postData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data'
        },
    });
    return response.data;
};

/**
 * עדכון פוסט קיים
 */
export const updatePost = async (postId: number, postData: FormData): Promise<Post> => {
    const response = await axios.put<Post>(`${API_URL}/api/Post/${postId}`, postData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data'
        },
    });
    return response.data;
};

/**
 * מחיקת פוסט
 */
export const deletePost = async (postId: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/Post/${postId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

/**
 * לייק לפוסט
 */
export const likePost = async (postId: number): Promise<void> => {
    await axios.post(`${API_URL}/api/Post/${postId}/like`, null, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

/**
 * הסרת לייק מפוסט
 */
export const unlikePost = async (postId: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/Post/${postId}/like`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};
