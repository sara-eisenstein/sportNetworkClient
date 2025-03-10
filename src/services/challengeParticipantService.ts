import axios from "axios";
import { ChallengeParticipant } from "../models/challengeParticipant";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * מביא את כל המשתתפים באתגר מסוים
 */
export const getChallengeParticipants = async (challengeId: number): Promise<ChallengeParticipant[]> => {
    const response = await axios.get<ChallengeParticipant[]>(
        `${API_URL}/api/Challenge/${challengeId}/participants`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return response.data;
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
    progress: number
): Promise<ChallengeParticipant> => {
    const response = await axios.put<ChallengeParticipant>(
        `${API_URL}/api/Challenge/${challengeId}/participants/${userId}/progress`,
        { progress },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    );
    return response.data;
};
