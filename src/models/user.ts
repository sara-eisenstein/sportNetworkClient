export enum FitnessLevel {
    Beginner = 0,
    Intermediate = 1,
    Advanced = 2,
    Professional = 3
}

export interface UserDto {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    level: FitnessLevel;
    profilePicture: string;
    goals: string;
    bio: string;
    dateJoined: string;
    status: boolean;
    isFollowing?: boolean;
}

export interface PublicUserDto {
    userId: number;
    firstName: string;
    lastName: string;
    level: FitnessLevel;
    profilePicture: string;
    goals: string;
    bio: string;
    dateJoined: string;
    isFollowing?: boolean;
}

