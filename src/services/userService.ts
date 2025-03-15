import axios from "axios";
import { UserDto, PublicUserDto } from "../models/user";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * מביא את כל המשתמשים
 */
export const getUsers = async (): Promise<UserDto[]> => {
  const response = await axios.get<UserDto[]>(`${API_URL}/api/User`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

/**
 * מביא משתמש לפי ID
 */
export const getUserById = async (id: number): Promise<UserDto> => {
  const response = await axios.get<UserDto>(`${API_URL}/api/User/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

/**
 * הוספת משתמש חדש
 */
export const createUser = async (userData: FormData): Promise<string> => {
  const response = await axios.post(`${API_URL}/api/User`, userData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

/**
 * עדכון משתמש קיים
 */
export const updateUser = async (id: number, userData: FormData): Promise<string> => {
  const response = await axios.put(`${API_URL}/api/User/${id}`, userData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

/**
 * מביא תמונת פרופיל של משתמש
 */
export const getUserImage = async (id: number): Promise<string> => {
    try {
        console.log(`🔄 Fetching profile image for user ${id} from ${API_URL}/getUserImage/${id}`);
        
        const response = await axios.get(`${API_URL}/getUserImage/${id}`, {
            responseType: 'blob'
        }).catch(error => {
            console.error('Network error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                headers: error.response?.headers,
                url: error.config?.url
            });
            throw error;
        });

        console.log('Response headers:', response.headers);
        console.log('Response status:', response.status);
        console.log('Response type:', response.data.type);

        if (!response.data || response.data.size === 0) {
            console.warn(`Empty image data received for user ${id}`);
            return '/default-avatar.png';
        }

        // בדיקה שהתגובה היא אכן תמונה
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
            console.warn(`Invalid content type for user ${id}: ${contentType}`);
            return '/default-avatar.png';
        }

        // יצירת URL מקומי לתמונה
        const imageUrl = URL.createObjectURL(response.data);
        console.log(`✅ Profile image URL created for user ${id}:`, imageUrl);
        return imageUrl;
    } catch (error: any) {
        console.error(`❌ Failed to fetch profile image for user ${id}:`, {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            contentType: error.response?.headers?.['content-type'],
            url: error.config?.url
        });
        return '/default-avatar.png';
    }
};

/**
 * מביא את המידע הציבורי של משתמש לפי מזהה
 */
export const getPublicUserData = async (userId: number): Promise<PublicUserDto> => {
    try {
        console.log(`🔄 Fetching public data for user ${userId}`);
        const response = await axios.get<PublicUserDto>(`${API_URL}/api/User/${userId}/public`);
        console.log(`✅ Successfully fetched public data for user ${userId}:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error(`❌ Failed to fetch public data for user ${userId}:`, {
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw error;
    }
};
