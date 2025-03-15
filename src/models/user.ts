export enum FitnessLevel {
    Beginner = "Beginner",
    Intermediate = "Intermediate",
    Advanced = "Advanced",
    Professional = "Professional",
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
  }
  
