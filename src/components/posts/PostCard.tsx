import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { removePost, toggleLike, editPost } from '../../store/slices/postSlice';
import { Post } from '../../models/post';
import CommentList from '../comments/CommentList';
import { getPostImage } from '../../services/postService';
import { getUserImage, getPublicUserData } from '../../services/userService';
import { getPostLikeCount } from '../../services/postService';
import { PublicUserDto } from '../../models/user';
import './PostCard.css';
import { Link } from 'react-router-dom';

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
    const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
    const [isLiked, setIsLiked] = useState<boolean>(post.isLiked || false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // טעינת תמונת הפוסט
        if (post.postId) {
            console.log('🔄 Loading image for post:', post.postId);
            getPostImage(post.postId)
                .then(url => {
                    if (!url) {
                        console.log('⚠️ No image URL returned for post:', post.postId);
                        setPostImageUrl('/no-image-placeholder.png');
                        return;
                    }
                    console.log('✅ Image loaded successfully for post:', post.postId, 'URL:', url);
                    setPostImageUrl(url);
                })
                .catch(error => {
                    console.error('❌ Failed to load image for post:', post.postId, error);
                    setPostImageUrl('/no-image-placeholder.png');
                });

            // טעינת מספר הלייקים
            getPostLikeCount(post.postId)
                .then(count => {
                    console.log('✅ Like count loaded:', count);
                    setLikesCount(count);
                })
                .catch(error => {
                    console.error('❌ Failed to load like count:', error);
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

    const handleLike = async () => {
        console.log('🔄 handleLike called with:', {
            currentUser,
            postId: post.postId,
            isCurrentlyLiked: isLiked,
            currentLikeCount: likesCount
        });

        if (!currentUser?.userId) {
            console.error('❌ User ID is missing! Cannot toggle like.');
            return;
        }

        if (!post.postId) {
            console.error('❌ Post ID is missing! Cannot toggle like.');
            return;
        }

        const newIsLiked = !isLiked;
        
        try {
            // שליחת הבקשה לשרת
            console.log('🔄 Dispatching toggleLike with:', {
                postId: post.postId,
                userId: currentUser.userId,
                isLiked: newIsLiked
            });

            await dispatch(toggleLike({ 
                postId: post.postId, 
                userId: currentUser.userId,
                isLiked: newIsLiked 
            })).unwrap();

            // עדכון המצב המקומי
            setIsLiked(newIsLiked);
            
            // עדכון מספר הלייקים
            const newCount = Math.max(0, likesCount + (newIsLiked ? 1 : -1));
            setLikesCount(newCount);

            console.log('✅ Like state updated:', {
                isLiked: newIsLiked,
                likesCount: newCount
            });

        } catch (error) {
            console.error('❌ Failed to toggle like:', error);
            // במקרה של שגיאה לא משנים את המצב
        }
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) {
            console.error('❌ Edit content is empty');
            return;
        }

        try {
            setIsSubmitting(true);
            
            const formData = new FormData();
            // שדות חובה לפי הקונטרולר בצד שרת
            formData.append('Id', post.postId!.toString());
            formData.append('Content', editContent.trim());
            
            // הוספת מזהה המשתמש אם קיים
            if (post.userId) {
                formData.append('UserId', post.userId.toString());
            }
            
            // הוספת תאריך היצירה המקורי
            if (post.createdDate) {
                formData.append('CreatedDate', post.createdDate);
            }
            
            // הוספת תמונה חדשה אם נבחרה
            if (selectedImage) {
                formData.append('File', selectedImage);
            }

            console.log('📤 Saving edited post:', {
                postId: post.postId,
                content: editContent.trim(),
                hasImage: !!selectedImage,
                imageFileName: selectedImage?.name
            });

            await dispatch(editPost({ postId: post.postId!, postData: formData })).unwrap();
            
            console.log('✅ Post edited successfully');
            setIsEditing(false);
            setSelectedImage(null);
        } catch (error) {
            console.error('❌ Failed to edit post:', error);
        } finally {
            setIsSubmitting(false);
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
                    <Link to={`/user/${post.userId}`} className="user-name">
                        {author ? `${author.firstName} ${author.lastName}` : 'טוען...'}
                    </Link>
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
                        accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                        onChange={handleImageChange}
                    />
                    <small className="file-info">
                        קבצים נתמכים: JPG, PNG, GIF, WEBP, BMP
                    </small>
                    <div className="edit-actions">
                        <button onClick={handleSaveEdit}>שמור</button>
                        <button onClick={() => setIsEditing(false)}>ביטול</button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="post-content">{post.content}</p>
                    {post.postId && (
                        <div className="post-image-container">
                            {postImageUrl && postImageUrl !== '/no-image-placeholder.png' ? (
                                <img 
                                    src={postImageUrl}
                                    alt="תמונת פוסט" 
                                    className="post-image"
                                    loading="lazy"
                                    onError={(e) => {
                                        console.error('❌ Failed to load post image:', {
                                            postId: post.postId,
                                            url: (e.target as HTMLImageElement).src,
                                            error: 'Image loading failed'
                                        });
                                        const target = e.target as HTMLImageElement;
                                        if (target.src !== `${window.location.origin}/no-image-placeholder.png`) {
                                            target.src = '/no-image-placeholder.png';
                                        }
                                    }}
                                />
                            ) : (
                                <div className="no-image-message">אין תמונה זמינה</div>
                            )}
                        </div>
                    )}
                </>
            )}

            <div className="post-footer">
                <button 
                    className={`like-button ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    {isLiked ? '❤️' : '🤍'} {likesCount}
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
