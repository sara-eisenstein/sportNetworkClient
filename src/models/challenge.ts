export enum ChallengeStatus {
    Active = "Active",
    Completed = "Completed",
    Failed = "Failed"
}

export enum ChallengeType {
    Running = "Running",
    Cycling = "Cycling",
    Swimming = "Swimming",
    Workout = "Workout",
    Other = "Other"
}

export interface Challenge {
    challengeId?: number;
    title: string;
    description: string;
    level: number;
    startDate: string;
    endDate: string;
    type?: ChallengeType;
    creatorId?: number;
    creatorName?: string;
    creatorProfilePicture?: string;
    status?: ChallengeStatus;
    progress?: string; // "true" או "false" - האם המשתתף השלים את האתגר
    participantsCount?: number;
    isParticipating?: boolean;
} 