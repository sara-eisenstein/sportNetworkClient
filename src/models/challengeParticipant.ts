import { ChallengeStatus } from './challenge';

export interface ChallengeParticipant {
    participantId?: number;
    challengeId: number;
    userId: number;
    userName?: string;
    userProfilePicture?: string;
    joinDate: Date;
    currentProgress: number;
    status: ChallengeStatus;
    lastUpdateDate: Date;
} 