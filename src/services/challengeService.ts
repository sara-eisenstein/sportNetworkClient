import axios from "axios";
import { Challenge } from "../models/challenge";
import { store } from "../store/store";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * מביא את כל האתגרים הפעילים
 */
export const getAllChallenges = async (): Promise<Challenge[]> => {
    const response = await axios.get<Challenge[]>(
        `${API_URL}/api/Challenge`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return response.data;
};

/**
 * מביא אתגרים של משתמש מסוים
 */
export const getUserChallenges = async (userId: number): Promise<Challenge[]> => {
    try {
        console.log('Fetching challenges for user:', userId);
        console.log('API URL:', `${API_URL}/challengeToUser?userId=${userId}`);
        
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await axios.get<Challenge[]>(
            `${API_URL}/challengeToUser?userId=${userId}`,
            {
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        
        console.log('Received challenges:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error in getUserChallenges:', error);
        if (axios.isAxiosError(error)) {
            console.error('Response data:', error.response?.data);
            console.error('Response status:', error.response?.status);
            if (error.response?.status === 404) {
                console.log('No challenges found for user');
                return [];
            }
        }
        throw new Error(`Failed to fetch user challenges: ${error.message}`);
    }
};

/**
 * מביא אתגר לפי מזהה
 */
export const getChallengeById = async (challengeId: number): Promise<Challenge> => {
    const response = await axios.get<Challenge>(`${API_URL}/api/Challenge/${challengeId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
};

/**
 * יצירת אתגר חדש
 */
export const createChallenge = async (challengeData: {
    Title: string;
    Description: string;
    Level: number;
    StartDate: string;
    EndDate: string;
}): Promise<Challenge> => {
    // Get user info from Redux store
    const currentUser = store.getState().auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    const userId = currentUser.userId;
    console.log('Creating challenge with creator ID:', userId);

    const formData = new FormData();
    formData.append('ChallengeId', '');
    formData.append('Title', challengeData.Title);
    formData.append('Description', challengeData.Description);
    formData.append('Level', challengeData.Level.toString());
    formData.append('StartDate', challengeData.StartDate);
    formData.append('EndDate', challengeData.EndDate);
    formData.append('CreatorId', userId.toString());

    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const response = await axios.post<Challenge>(`${API_URL}/api/Challenge`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.data;
};

/**
 * עדכון אתגר קיים
 */
export const updateChallenge = async (challengeId: number, challengeData: Partial<Challenge>): Promise<Challenge> => {
    const response = await axios.put<Challenge>(`${API_URL}/api/Challenge/${challengeId}`, challengeData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
};

/**
 * מחיקת אתגר
 */
export const deleteChallenge = async (challengeId: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/Challenge/${challengeId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

/**
 * הצטרפות לאתגר
 */
export const joinChallenge = async (challengeId: number): Promise<void> => {
    const formData = new FormData();
    formData.append('ChallengeParticipantId', '');
    formData.append('ChallengeId', challengeId.toString());

    // Get userId from JWT token
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    formData.append('UserId', userId);
    formData.append('Progress', '0');

    await axios.post(`${API_URL}/api/ChallengeParticipant`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
        },
    });
};

/**
 * עזיבת אתגר
 */
export const leaveChallenge = async (challengeId: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/Challenge/${challengeId}/leave`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
};

/**
 * עדכון התקדמות באתגר
 */
export const updateProgress = async (challengeId: number, progress: string): Promise<Challenge> => {
    const response = await axios.put<Challenge>(
        `${API_URL}/api/Challenge/${challengeId}/progress`,
        { progress },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return response.data;
};
