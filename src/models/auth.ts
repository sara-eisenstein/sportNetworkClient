import { FitnessLevel } from './user';

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    bio?: string;
    goals?: string;
    level: FitnessLevel;
    profilePicture?: File;
}

export interface AuthResponse {
    token: string;
} 