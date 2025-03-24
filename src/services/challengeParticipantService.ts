import axios from "axios";
import { ChallengeParticipant } from "../models/challengeParticipant";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * מביא את כל המשתתפים באתגר מסוים
 */
export const getChallengeParticipants = async (challengeId: number): Promise<ChallengeParticipant[]> => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }

        const response = await axios.get<ChallengeParticipant[]>(
            `${API_URL}/api/Challenge/participants/${challengeId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Response from participants API:', response);
        return response.data;
    } catch (error) {
        console.error('Error fetching challenge participants:', error);
        throw error;
    }
};

/**
 * מביא את כל האתגרים שמשתמש משתתף בהם
 */
export const getUserParticipations = async (userId: number): Promise<ChallengeParticipant[]> => {
    const response = await axios.get<ChallengeParticipant[]>(
        `${API_URL}/api/Challenge/user/${userId}/participations`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return response.data;
};

/**
 * מביא פרטי השתתפות ספציפית
 */
export const getParticipationDetails = async (challengeId: number, userId: number): Promise<ChallengeParticipant> => {
    const response = await axios.get<ChallengeParticipant>(
        `${API_URL}/api/Challenge/${challengeId}/participants/${userId}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return response.data;
};

/**
 * מעדכן התקדמות של משתתף
 */
export const updateParticipantProgress = async (
    challengeId: number,
    userId: number,
    progress: string
): Promise<ChallengeParticipant> => {
    // מביאים את כל ההשתתפויות של המשתמש
    const participations = await getUserChallengeParticipations(userId);
    const participation = participations.find(p => p.challengeId === challengeId);
    
    if (!participation) {
        throw new Error('Participation not found');
    }
    
    const formData = new FormData();
    formData.append('ChallengeParticipantId', participation.challengeParticipantId.toString());
    formData.append('ChallengeId', challengeId.toString());
    formData.append('UserId', userId.toString());
    formData.append('Progress', progress);

    const response = await axios.put<ChallengeParticipant>(
        `${API_URL}/api/ChallengeParticipant/${participation.challengeParticipantId}/progress`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return response.data;
};

/**
 * מביא את כל ההשתתפויות של משתמש באתגרים
 */
export const getUserChallengeParticipations = async (userId: number): Promise<ChallengeParticipant[]> => {
    const response = await axios.get<ChallengeParticipant[]>(
        `${API_URL}/api/ChallengeParticipant/user/${userId}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return response.data;
};
