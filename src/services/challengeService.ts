import axios from "axios";
import { Challenge } from "../models/challenge";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * מביא את כל האתגרים הפעילים
 */
export const getAllChallenges = async (): Promise<Challenge[]> => {
    const response = await axios.get<Challenge[]>(`${API_URL}/api/Challenge`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
};

/**
 * מביא אתגרים של משתמש מסוים
 */
export const getUserChallenges = async (userId: number): Promise<Challenge[]> => {
    const response = await axios.get<Challenge[]>(`${API_URL}/api/Challenge/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return response.data;
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
    const formData = new FormData();
    formData.append('ChallengeId', '');
    formData.append('Title', challengeData.Title);
    formData.append('Description', challengeData.Description);
    formData.append('Level', challengeData.Level.toString());
    formData.append('StartDate', challengeData.StartDate);
    formData.append('EndDate', challengeData.EndDate);

    const response = await axios.post<Challenge>(`${API_URL}/api/Challenge`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
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
    await axios.post(`${API_URL}/api/Challenge/${challengeId}/join`, null, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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
export const updateProgress = async (challengeId: number, progress: number): Promise<Challenge> => {
    const response = await axios.post<Challenge>(
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
