import axios from "axios";
import { Post } from "../models/post";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * מביא את כל הפוסטים
 */
export const getAllPosts = async (): Promise<Post[]> => {
    const response = await axios.get<Post[]>(`${API_URL}/api/Post`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
    
    // לוג מפורט של הנתונים הגולמיים
    console.log('Raw response:', response);
    console.log('Raw post data:', JSON.stringify(response.data, null, 2));
    console.log('First post example:', response.data[0]);
    
    return response.data.map(post => ({
        ...post,
        // אין צורך להמיר את התאריך ל-Date, משאירים אותו כמחרוזת
        userName: post.userName || "משתמש לא ידוע",
        userProfilePicture: post.userProfilePicture || '/default-avatar.png'
    }));
};

/**
 * מביא פוסטים של משתמש מסוים
 */
export const getPostsByUserId = async (userId: number): Promise<Post[]> => {
    const response = await axios.get<Post[]>(`${API_URL}/api/Post/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.map(post => ({
        ...post,
        // אין צורך להמיר את התאריך ל-Date, משאירים אותו כמחרוזת
        userName: post.userName || "משתמש לא ידוע",
        userProfilePicture: post.userProfilePicture || '/default-avatar.png'
    }));
};

/**
 * מביא פוסט לפי מזהה
 */
export const getPostById = async (postId: number): Promise<Post> => {
    const response = await axios.get<Post>(`${API_URL}/api/Post/${postId}`);
    return response.data;
};

/**
 * יצירת פוסט חדש (כולל תמונה)
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
 * עדכון פוסט קיים (כולל אפשרות לעדכן תמונה)
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
export const likePost = async (postId: number, userId: number): Promise<void> => {
    await axios.post(`${API_URL}/api/Post/${postId}/like/${userId}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
};

/**
 * הסרת לייק מפוסט
 */
export const unlikePost = async (postId: number, userId: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/Post/${postId}/like/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
};



/**
 * מביא את כמות הלייקים של פוסט מסוים
 */
export const getPostLikeCount = async (postId: number): Promise<number> => {
    try {
        const response = await axios.get<number>(`${API_URL}/api/Post/${postId}/likes`);
        return response.data;
    } catch (error) {
        console.error(`❌ Failed to fetch like count for post ${postId}`, error);
        return 0; // אם יש שגיאה, נחזיר 0 כדי לא להציג נתונים שגויים
    }
};

/**
 * מביא תמונה של פוסט (עובד עם `byte[]`)
 */
export const getPostImage = async (postId: number): Promise<string> => {
    try {
        const response = await axios.get(`${API_URL}/api/Post/getPostImage/${postId}`, {
            responseType: 'blob'
        });

        // יצירת URL מקומי לתמונה
        const imageUrl = URL.createObjectURL(response.data);
        console.log(`✅ getPostImage - URL for post ${postId}:`, imageUrl);
        return imageUrl;
    } catch (error) {
        console.error(`❌ Failed to fetch post image for post ${postId}`, error);
        return '/no-image-placeholder.png';
    }
};
