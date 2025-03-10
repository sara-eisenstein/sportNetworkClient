export interface Follower {
    followerId: number;
    followingUserId: number; // המשתמש שעוקב
    followedUserId: number;  // המשתמש שעוקבים אחריו
    dateFollowed: Date;
}

export interface FollowerStats {
    followersCount: number;
    followingCount: number;
} 