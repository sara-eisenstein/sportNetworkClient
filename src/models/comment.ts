export interface Comment {
    commentId?: number;
    postId: number;
    userId: number;
    content: string;
    dateCreated: Date;
    userName?: string;
    userProfilePicture?: string;
} 