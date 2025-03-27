import axios from 'axios';

interface ChallengeRecommendation {
    challengeId: number;
}

const API_URL = process.env.REACT_APP_API_URL;


export const getRecommendedChallenges = async (userPrompt: string, token: string): Promise<number[]> => {
    try {
        const response = await axios.post<ChallengeRecommendation[]>(
            `${API_URL}/api/ChallengeRecommendation/recommend`,
            { userPrompt },
            {
                headers: {
                    'accept': 'text/plain',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data.map(rec => rec.challengeId);
    } catch (error) {
        console.error('Error getting challenge recommendations:', error);
        throw error;
    }
}; 