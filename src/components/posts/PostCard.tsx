import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { removePost, toggleLike, editPost } from '../../store/slices/postSlice';
import { Post } from '../../models/post';
import CommentList from '../comments/CommentList';
import { getPostImage } from '../../services/postService';
import { getUserImage, getPublicUserData } from '../../services/userService';
import { PublicUserDto } from '../../models/user';
import './PostCard.css';

interface Props {
    post: Post;
    isOwnPost?: boolean;
}

const PostCard: React.FC<Props> = ({ post, isOwnPost = false }) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [showComments, setShowComments] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [postImageUrl, setPostImageUrl] = useState<string>('');
    const [userProfileImageUrl, setUserProfileImageUrl] = useState<string>('');
    const [author, setAuthor] = useState<PublicUserDto | null>(null);

    useEffect(() => {
        // טעינת תמונת הפוסט
        if (post.postId) {
            console.log('🔄 Loading image for post:', post.postId);
            getPostImage(post.postId)
                .then(url => {
                    console.log('✅ Image loaded successfully:', url);
                    setPostImageUrl(url);
                })
                .catch(error => {
                    console.error('❌ Failed to load image:', error);
                    setPostImageUrl('/no-image-placeholder.png');
                });
        }

        // טעינת תמונת הפרופיל של המשתמש
        if (post.userId) {
            console.log('🔄 Loading profile image for user:', post.userId);
            getUserImage(post.userId)
                .then(profileImageUrl => {
                    if (!profileImageUrl) {
                        throw new Error('No profile image URL returned');
                    }
                    console.log('✅ Profile image URL set:', profileImageUrl);
                    setUserProfileImageUrl(profileImageUrl);
                })
                .catch(error => {
                    console.error('❌ Failed to fetch profile image:', {
                        userId: post.userId,
                        error: error.message
                    });
                    setUserProfileImageUrl('/default-avatar.png');
                });

            // טעינת מידע על המשתמש
            getPublicUserData(post.userId)
                .then(userData => {
                    console.log('✅ Author data loaded:', userData);
                    setAuthor(userData);
                })
                .catch(error => {
                    console.error('❌ Failed to load author data:', error);
                });
        }

        // ניקוי URLs כשהקומפוננטה מתפרקת
        return () => {
            if (postImageUrl && postImageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(postImageUrl);
            }
            if (userProfileImageUrl && userProfileImageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(userProfileImageUrl);
            }
        };
    }, [post.postId, post.userId]);

    // הוספת לוג בזמן רינדור
    console.log('🎨 Rendering post:', {
        postId: post.postId,
        userId: post.userId,
        hasImage: !!post.postId,
        postImageUrl,
        userProfileImageUrl,
        authorName: author ? `${author.firstName} ${author.lastName}` : 'Loading...'
    });

    const handleDelete = () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק פוסט זה?')) {
            dispatch(removePost(post.postId!));
        }
    };

    const handleLike = () => {
        if (!currentUser?.userId) {
            console.error('❌ User ID is missing! Cannot toggle like.');
            return;
        }
        if (post.postId) {
            dispatch(toggleLike({ 
                postId: post.postId, 
                userId: currentUser.userId,
                isLiked: !post.isLiked 
            }));
        }
    };

    const handleEdit = () => {
        if (editContent.trim()) {
            const formData = new FormData();
            formData.append('content', editContent);
            if (selectedImage) {
                formData.append('image', selectedImage);
            }
            dispatch(editPost({ postId: post.postId!, postData: formData }));
            setIsEditing(false);
            setSelectedImage(null);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <img 
                    src={userProfileImageUrl || '/default-avatar.png'} 
                    alt={author ? `${author.firstName} ${author.lastName}` : "Unknown User"} 
                    className="user-avatar"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== `${window.location.origin}/default-avatar.png`) {
                            console.error('Failed to load profile image:', {
                                userId: post.userId,
                                url: target.src
                            });
                            target.src = '/default-avatar.png';
                        }
                    }}
                />
                <div className="post-info">
                    <span className="user-name">
                        {author ? `${author.firstName} ${author.lastName}` : 'טוען...'}
                    </span>
                    <span className="post-date">
                        {post.createdDate ? new Date(post.createdDate).toLocaleDateString('he-IL') : 'תאריך לא זמין'}
                    </span>
                </div>
                {isOwnPost && (
                    <div className="post-actions">
                        <button onClick={() => setIsEditing(true)}>ערוך</button>
                        <button onClick={handleDelete}>מחק</button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="edit-post">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    <div className="edit-actions">
                        <button onClick={handleEdit}>שמור</button>
                        <button onClick={() => setIsEditing(false)}>ביטול</button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="post-content">{post.content}</p>
                    {post.postId && postImageUrl && (
                        <img 
                            src={postImageUrl}
                            alt="תמונת פוסט" 
                            className="post-image"
                            onError={(e) => {
                                console.error('Failed to load post image:', {
                                    postId: post.postId,
                                    error: e
                                });
                                const target = e.target as HTMLImageElement;
                                target.src = '/no-image-placeholder.png';
                            }}
                        />
                    )}
                </>
            )}

            <div className="post-footer">
                <button 
                    className={`like-button ${post.isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    {post.isLiked ? '❤️' : '🤍'} {post.likesCount}
                </button>
                <button 
                    className="comments-button"
                    onClick={() => setShowComments(!showComments)}
                >
                    💬 {post.commentsCount}
                </button>
            </div>

            {showComments && (
                <CommentList postId={post.postId!} />
            )}
        </div>
    );
};

export default PostCard;
