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
    try {
        console.log('🔄 Updating post:', postId);
        console.log('📦 Post data contents:');
        postData.forEach((value, key) => {
            const displayValue = value instanceof File ? `File: ${value.name}` : String(value);
            console.log(`- ${key}: ${displayValue}`);
        });

        const token = localStorage.getItem("token");
        console.log('🔑 Token present:', !!token);

        // קבלת הפוסט הקיים לפני העדכון
        const existingPost = await getPostById(postId);
        console.log('📦 Existing post data:', existingPost);

        // בדיקה אם יש תמונה חדשה
        const imageFile = postData.get('File') || postData.get('ImageFile');
        const hasNewImage = imageFile instanceof File;

        // אם אין תמונה חדשה, ננסה לשלוח JSON
        if (!hasNewImage) {
            try {
                console.log('🖼️ No new image, sending JSON to preserve existing image');
                
                const jsonData = {
                    id: postId,
                    content: postData.get('Content') || postData.get('content') || existingPost.content,
                    userId: existingPost.userId,
                    createdDate: existingPost.createdDate
                    // לא שולחים שדה File או Media בכלל
                };
                
                console.log('📦 JSON data for update:', jsonData);
                
                const jsonResponse = await axios.put(
                    `${API_URL}/api/Post/${postId}`,
                    jsonData,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                console.log('✅ Post updated successfully with JSON:', jsonResponse.data);
                
                // קבלת הפוסט המעודכן
                const updatedPost = await getPostById(postId);
                return updatedPost;
            } catch (jsonError) {
                console.error('❌ JSON approach failed:', jsonError);
                console.log('⚠️ Trying with original image...');
                
                // אם הגישה עם JSON נכשלה, ננסה להשיג את התמונה המקורית
                try {
                    // שליחת בקשה לקבלת התמונה המקורית
                    const imageResponse = await axios.get(`${API_URL}/api/Post/getPostImage/${postId}`, {
                        responseType: 'blob'
                    });
                    
                    // יצירת קובץ מה-blob
                    const originalImageBlob = imageResponse.data;
                    const originalImageFile = new File([originalImageBlob], `original_image_${postId}.jpg`, {
                        type: originalImageBlob.type || 'image/jpeg'
                    });
                    
                    // יצירת FormData חדש עם התמונה המקורית
                    const formDataWithOriginalImage = new FormData();
                    formDataWithOriginalImage.append('Id', postId.toString());
                    formDataWithOriginalImage.append('Content', postData.get('Content') || postData.get('content') || existingPost.content);
                    
                    if (existingPost.userId) {
                        formDataWithOriginalImage.append('UserId', existingPost.userId.toString());
                    }
                    
                    if (existingPost.createdDate) {
                        formDataWithOriginalImage.append('CreatedDate', existingPost.createdDate);
                    }
                    
                    formDataWithOriginalImage.append('File', originalImageFile);
                    
                    console.log('🖼️ Sending form data with original image');
                    
                    const originalImageResponse = await axios.put(
                        `${API_URL}/api/Post/${postId}`,
                        formDataWithOriginalImage,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    
                    console.log('✅ Post updated successfully with original image:', originalImageResponse.data);
                    
                    // קבלת הפוסט המעודכן
                    const updatedPost = await getPostById(postId);
                    return updatedPost;
                } catch (originalImageError) {
                    console.error('❌ Original image approach failed:', originalImageError);
                    throw originalImageError;
                }
            }
        }
        
        // אם יש תמונה חדשה, שולחים FormData עם התמונה החדשה
        console.log('📸 New image detected, sending with FormData');
        
        // יצירת FormData חדש עם כל השדות הקיימים
        const formData = new FormData();
        
        // הוספת שדות חובה
        formData.append('Id', postId.toString());
        
        // הוספת תוכן - אם יש חדש, משתמשים בו, אחרת משתמשים בקיים
        const newContent = postData.get('Content') || postData.get('content');
        formData.append('Content', newContent ? newContent.toString() : existingPost.content);
        
        // הוספת מזהה המשתמש
        if (existingPost.userId) {
            formData.append('UserId', existingPost.userId.toString());
        }
        
        // הוספת תאריך היצירה
        if (existingPost.createdDate) {
            formData.append('CreatedDate', existingPost.createdDate);
        }
        
        // הוספת התמונה החדשה
        formData.append('File', imageFile as File);
        console.log('📸 Sending new image:', (imageFile as File).name);
        
        // שליחת הנתונים כ-FormData
        const response = await axios.put(
            `${API_URL}/api/Post/${postId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        console.log('✅ Post updated successfully with new image:', response.data);
        
        // קבלת הפוסט המעודכן
        const updatedPost = await getPostById(postId);
        return updatedPost;
    } catch (error: any) {
        console.error('❌ Failed to update post:', error);
        
        if (axios.isAxiosError(error)) {
            console.error('Status:', error.response?.status);
            console.error('Status Text:', error.response?.statusText);
            console.error('Response Data:', error.response?.data);
            
            // הצגת שגיאות ולידציה אם קיימות
            if (error.response?.data?.errors) {
                console.error('Validation Errors:', JSON.stringify(error.response.data.errors, null, 2));
            }
        }
        
        throw error;
    }
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

/**
 * מביא את כל הפוסטים של משתמש ספציפי
 */
export const getUserPosts = async (userId: number): Promise<Post[]> => {
    try {
        console.log(`🔄 Fetching posts for user ${userId}`);
        const response = await axios.get<Post[]>(`${API_URL}/api/Post/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        console.log(`✅ Successfully fetched ${response.data.length} posts for user ${userId}`);
        return response.data;
    } catch (error: any) {
        console.error(`❌ Failed to fetch posts for user ${userId}:`, {
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        return []; // במקרה של שגיאה, נחזיר מערך ריק במקום לזרוק שגיאה
    }
};
