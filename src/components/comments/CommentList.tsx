import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchComments, createComment, editComment, removeComment } from '../../store/slices/commentSlice';
import { Comment } from '../../models/comment';

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

    useEffect(() => {
        dispatch(fetchComments(postId));
    }, [dispatch, postId]);

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
            dispatch(editComment({ commentId, content: editContent.trim() }));
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
                                    src={comment.userProfilePicture || '/default-avatar.png'} 
                                    alt={comment.userName} 
                                    className="user-avatar"
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
                                    <div className="comment-actions">
                                        <button onClick={() => handleStartEdit(comment)}>
                                            ערוך
                                        </button>
                                        <button onClick={() => handleDelete(comment.commentId!)}>
                                            מחק
                                        </button>
                                    </div>
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