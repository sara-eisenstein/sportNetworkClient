export interface Post {
    postId?: number;
    userId: number;
    content: string;
    imageUrl?: string;
    dateCreated: Date;
    userName?: string;
    userProfilePicture?: string;
    likesCount: number;
    commentsCount: number;
    isLiked?: boolean;
} 