import { ChallengeStatus } from './challenge';

export interface ChallengeParticipant {
    userId: number;
    challengeId: number;
    firstName: string;
    lastName: string;
    goals: string;
    bio: string;
    dateJoined: string;
    profilePicture: string;
    file: any;
} 