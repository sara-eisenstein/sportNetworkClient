import { ChallengeStatus } from './challenge';

export interface ChallengeParticipant {
    challengeParticipantId: number;
    userId: number;
    challengeId: number;
    firstName: string;
    lastName: string;
    goals: string;
    bio: string;
    dateJoined: string;
    profilePicture: string;
    file: any;
    progress: string; // "true" או "false" - האם המשתתף השלים את האתגר
} 