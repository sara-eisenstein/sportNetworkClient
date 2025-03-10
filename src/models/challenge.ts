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
    type: ChallengeType;
    startDate: Date;
    endDate: Date;
    goal: number; // המטרה המספרית (למשל: 5 ק"מ ריצה)
    unit: string; // יחידת המדידה (ק"מ, דקות, חזרות וכו')
    creatorId: number;
    creatorName?: string;
    creatorProfilePicture?: string;
    status: ChallengeStatus;
    currentProgress?: number;
    participantsCount: number;
    isParticipating?: boolean;
} 