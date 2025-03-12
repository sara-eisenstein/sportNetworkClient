export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    bio: string;
    goals: string;
    profilePicture: File | undefined; 
}

export interface AuthResponse {
    token: string;
} 