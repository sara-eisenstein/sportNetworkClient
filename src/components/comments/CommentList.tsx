import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchComments, createComment, editComment, removeComment } from '../../store/slices/commentSlice';
import { Comment } from '../../models/comment';
import { getUserImage } from '../../services/userService';

interface Props {
    postId: number;
}

const CommentList: React.FC<Props> = ({ postId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { comments, loading, error } = useSelector((state: RootState) => state.comments);
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [profileImages, setProfileImages] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        dispatch(fetchComments(postId));
    }, [dispatch, postId]);

    // טעינת תמונות פרופיל לכל התגובות
    useEffect(() => {
        const loadProfileImages = async () => {
            const imagePromises = comments.map(async (comment) => {
                if (comment.userId && !profileImages[comment.userId]) {
                    try {
                        const imageUrl = await getUserImage(comment.userId);
                        setProfileImages(prev => ({
                            ...prev,
                            [comment.userId]: imageUrl
                        }));
                    } catch (error) {
                        console.error(`Failed to load profile image for user ${comment.userId}:`, error);
                        setProfileImages(prev => ({
                            ...prev,
                            [comment.userId]: '/default-avatar.png'
                        }));
                    }
                }
            });

            await Promise.all(imagePromises);
        };

        loadProfileImages();
    }, [comments]);

    // ניקוי URLs כשהקומפוננטה מתפרקת
    useEffect(() => {
        return () => {
            Object.values(profileImages).forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [profileImages]);

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && currentUser?.userId) {
            console.log('🔄 Submitting new comment:', {
                postId,
                userId: currentUser.userId,
                content: newComment.trim()
            });
            dispatch(createComment({
                postId,
                userId: currentUser.userId,
                content: newComment.trim()
            }));
            setNewComment('');
        } else {
            console.log('❌ Cannot submit comment:', {
                hasContent: !!newComment.trim(),
                hasUserId: !!currentUser?.userId
            });
        }
    };

    const handleStartEdit = (comment: Comment) => {
        setEditingCommentId(comment.commentId!);
        setEditContent(comment.content);
    };

    const handleSaveEdit = (commentId: number) => {
        if (editContent.trim()) {
            const formData = new FormData();
            formData.append('CommentId', commentId.toString());
            formData.append('Content', editContent.trim());
            
            dispatch(editComment({ 
                commentId, 
                content: editContent.trim(),
                formData,
                postId 
            }));
            setEditingCommentId(null);
            setEditContent('');
        }
    };

    const handleDelete = (commentId: number) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק תגובה זו?')) {
            dispatch(removeComment(commentId));
        }
    };

    if (loading) return <div>טוען תגובות...</div>;
    if (error) return <div>שגיאה: {error}</div>;

    return (
        <div className="comments-section">
            <h3>תגובות</h3>
            
            {/* טופס תגובה חדשה */}
            <form onSubmit={handleSubmitComment} className="comment-form">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="כתוב תגובה..."
                    rows={3}
                />
                <button type="submit" disabled={!newComment.trim()}>
                    שלח תגובה
                </button>
            </form>

            {/* רשימת התגובות */}
            <div className="comments-list">
                {comments.length === 0 ? (
                    <div className="no-comments">
                        אין עדיין תגובות לפוסט זה. תהיה הראשון להגיב!
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.commentId} className="comment">
                            <div className="comment-header">
                                <img 
                                    src={profileImages[comment.userId] || '/default-avatar.png'}
                                    alt={comment.userName} 
                                    className="user-avatar"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                                    }}
                                />
                                <span className="user-name">{comment.userName}</span>
                                <span className="comment-date">
                                    {new Date(comment.dateCreated).toLocaleDateString('he-IL')}
                                </span>
                            </div>
                            
                            {editingCommentId === comment.commentId ? (
                                <div className="edit-comment">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={3}
                                    />
                                    <div className="edit-actions">
                                        <button onClick={() => handleSaveEdit(comment.commentId!)}>
                                            שמור
                                        </button>
                                        <button onClick={() => setEditingCommentId(null)}>
                                            ביטול
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="comment-content">
                                    <p>{comment.content}</p>
                                    {currentUser?.userId === comment.userId && (
                                        <div className="comment-actions">
                                            <button onClick={() => handleStartEdit(comment)}>
                                                ערוך
                                            </button>
                                            <button onClick={() => handleDelete(comment.commentId!)}>
                                                מחק
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentList; 