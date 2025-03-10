import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { removePost, toggleLike, editPost } from '../../store/slices/postSlice';
import { Post } from '../../models/post';
import CommentList from '../comments/CommentList';
import './PostCard.css';

interface Props {
    post: Post;
    isOwnPost?: boolean;
}

const PostCard: React.FC<Props> = ({ post, isOwnPost = false }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [showComments, setShowComments] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleDelete = () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק פוסט זה?')) {
            dispatch(removePost(post.postId!));
        }
    };

    const handleLike = () => {
        dispatch(toggleLike({ postId: post.postId!, isLiked: post.isLiked || false }));
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
                    src={post.userProfilePicture || '/default-avatar.png'} 
                    alt={post.userName} 
                    className="user-avatar"
                />
                <div className="post-info">
                    <span className="user-name">{post.userName}</span>
                    <span className="post-date">
                        {new Date(post.dateCreated).toLocaleDateString('he-IL')}
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
                    {post.imageUrl && (
                        <img 
                            src={post.imageUrl} 
                            alt="תמונת פוסט" 
                            className="post-image"
                        />
                    )}
                </>
            )}

            <div className="post-footer">
                <button 
                    className={`like-button ${post.isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    {post.likesCount} לייקים
                </button>
                <button 
                    className="comments-button"
                    onClick={() => setShowComments(!showComments)}
                >
                    {post.commentsCount} תגובות
                </button>
            </div>

            {showComments && (
                <CommentList postId={post.postId!} />
            )}
        </div>
    );
};

export default PostCard; 