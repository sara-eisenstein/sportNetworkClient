export interface Post {
    postId?: number;
    userId: number;
    content: string;
    createdDate?: string;
    userName?: string;
    userProfilePicture?: string;
    commentsCount?: number;
    likesCount?: number;
    isLiked?: boolean;
    likes?: string; // רשימת מזההי משתמשים שהעשו לייק לפוסט
}

// מודל לשליחת פוסט חדש
export interface CreatePostDto {
    content: string;
    createdDate: string;
    imageFile?: File;
} 