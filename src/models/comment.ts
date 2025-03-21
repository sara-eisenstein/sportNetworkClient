export interface Comment {
    commentId?: number;
    postId: number;
    userId: number;
    content: string;
    createdDate: string;
    userName?: string;
    userProfilePicture?: string;
} 