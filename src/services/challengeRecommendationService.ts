import axios from 'axios';

interface ChallengeRecommendation {
    challengeId: number;
}

export const getRecommendedChallenges = async (userPrompt: string, token: string): Promise<number[]> => {
    try {
        const response = await axios.post<ChallengeRecommendation[]>(
            'https://localhost:7047/api/ChallengeRecommendation/recommend',
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