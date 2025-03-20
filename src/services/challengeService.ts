import axios from "axios";
import { Challenge } from "../models/challenge";
import { getPublicUserData, getUserImage } from "./userService";

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

    // Get creator details for each challenge
    const challengesWithCreators = await Promise.all(
        response.data.map(async (challenge) => {
            try {
                const creatorData = await getPublicUserData(challenge.creatorId);
                const profilePicture = await getUserImage(challenge.creatorId);
                return {
                    ...challenge,
                    creatorName: `${creatorData.firstName} ${creatorData.lastName}`,
                    creatorProfilePicture: profilePicture
                };
            } catch (error) {
                console.error(`Failed to fetch creator data for challenge ${challenge.challengeId}:`, error);
                return challenge;
            }
        })
    );

    return challengesWithCreators;
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
    // Get user info from token
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = parseInt(tokenPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
    const userName = tokenPayload["name"];
    const userProfilePicture = tokenPayload["picture"];

    console.log('Creating challenge with creator ID:', userId);

    const formData = new FormData();
    formData.append('ChallengeId', '');
    formData.append('Title', challengeData.Title);
    formData.append('Description', challengeData.Description);
    formData.append('Level', challengeData.Level.toString());
    formData.append('StartDate', challengeData.StartDate);
    formData.append('EndDate', challengeData.EndDate);
    formData.append('CreatorId', userId.toString());
    formData.append('CreatorName', userName || '');
    if (userProfilePicture) {
        formData.append('CreatorProfilePicture', userProfilePicture);
    }

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
