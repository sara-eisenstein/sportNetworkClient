import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchAllPosts, fetchUserPosts } from '../../store/slices/postSlice';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import './PostList.css';

interface Props {
    userId?: number;
    showCreatePost?: boolean;
}

const PostList: React.FC<Props> = ({ userId, showCreatePost = true }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { posts, userPosts, loading, error } = useSelector((state: RootState) => state.posts);
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserPosts(userId));
        } else {
            dispatch(fetchAllPosts());
        }
    }, [dispatch, userId]);

    if (loading) return <div className="posts-loading">טוען פוסטים...</div>;
    if (error) return <div className="posts-error">שגיאה: {error}</div>;

    const displayPosts = userId ? userPosts : posts;

    return (
        <div className="posts-container">
            {showCreatePost && <CreatePost />}
            
            <div className="posts-list">
                {displayPosts.map(post => (
                    <PostCard 
                        key={post.postId} 
                        post={post}
                        isOwnPost={currentUser?.userId === post.userId}
                    />
                ))}
                
                {displayPosts.length === 0 && (
                    <div className="no-posts">
                        {userId ? 'אין פוסטים להצגה' : 'עדיין אין פוסטים. היה הראשון לפרסם!'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostList; 