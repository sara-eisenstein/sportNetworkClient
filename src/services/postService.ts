import axios from "axios";
import { Post } from "../models/post";

// וידוא שיש ערך ברירת מחדל ל-API_URL
const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7047';

console.log('🌐 API URL:', API_URL);

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
 * יצירת פוסט חדש
 */
export const createPost = async (postData: FormData): Promise<Post> => {
    try {
        console.log('🔄 Creating post at:', `${API_URL}/api/Post`);
        
        // לוג של תוכן ה-FormData בצורה בטוחה
        console.log('📦 Post data contents:');
        // שימוש בשיטה בטוחה יותר מבחינת TypeScript
        const formDataEntries: {key: string, value: string}[] = [];
        postData.forEach((value, key) => {
            const displayValue = value instanceof File ? `File: ${value.name}` : String(value);
            formDataEntries.push({key, value: displayValue});
            console.log(`- ${key}: ${displayValue}`);
        });

        const token = localStorage.getItem("token");
        console.log('🔑 Token present:', !!token);

        const response = await axios.post<Post>(
            `${API_URL}/api/Post`,
            postData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('✅ Server response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to create post');
        if (axios.isAxiosError(error)) {
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Response Data:', error.response?.data);
            if (error.response?.data?.errors) {
                console.error('Validation Errors:', JSON.stringify(error.response.data.errors));
            }
        }
        throw error;
    }
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
    try {
        console.log('🔄 Adding like:', { postId, userId });
        await axios.post(`${API_URL}/api/Post/${postId}/like/${userId}`, null, {
            headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
        });
        console.log('✅ Like added successfully');
    } catch (error: any) {
        console.error('❌ Failed to add like:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * הסרת לייק מפוסט
 */
export const unlikePost = async (postId: number, userId: number): Promise<void> => {
    try {
        console.log('🔄 Removing like:', { postId, userId });
        await axios.delete(`${API_URL}/api/Post/${postId}/like/${userId}`, {
            headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            },
        });
        console.log('✅ Like removed successfully');
    } catch (error: any) {
        console.error('❌ Failed to remove like:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * מביא את כמות הלייקים של פוסט מסוים
 */
export const getPostLikeCount = async (postId: number): Promise<number> => {
    try {
        console.log('🔄 Fetching like count for post:', postId);
        const response = await axios.get<number>(`${API_URL}/api/Post/${postId}/likes`, {
            headers: { 
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Like count received:', response.data);
        return response.data ?? 0;
    } catch (error: any) {
        console.error('❌ Failed to fetch like count:', error.response?.data || error.message);
        return 0;
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
