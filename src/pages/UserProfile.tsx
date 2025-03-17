import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublicUserDto, FitnessLevel } from '../models/user';
import { Post } from '../models/post';
import { getPublicUserData, getUserImage } from '../services/userService';
import { getUserPosts } from '../services/postService';
import PostCard from '../components/posts/PostCard';
import { followUser, unfollowUser } from '../services/userService';
import './UserProfile.css';

const UserProfile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<PublicUserDto | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string>('/default-avatar.png');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                if (!userId) {
                    throw new Error('נדרש מזהה משתמש');
                }

                const userData = await getPublicUserData(parseInt(userId));
                setUser(userData);

                // טעינת תמונת הפרופיל
                try {
                    const imageUrl = await getUserImage(parseInt(userId));
                    setProfileImageUrl(imageUrl);
                } catch (imageError) {
                    console.error('שגיאה בטעינת תמונת פרופיל:', imageError);
                    setProfileImageUrl('/default-avatar.png');
                }

                const userPosts = await getUserPosts(parseInt(userId));
                setPosts(userPosts);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'שגיאה בטעינת נתוני המשתמש');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleFollowToggle = async () => {
        if (!user) return;

        try {
            if (user.isFollowing) {
                await unfollowUser(user.userId);
                setUser({ ...user, isFollowing: false });
            } else {
                await followUser(user.userId);
                setUser({ ...user, isFollowing: true });
            }
        } catch (err) {
            console.error('שגיאה בשינוי מצב המעקב:', err);
        }
    };

    if (isLoading) {
        return <div className="loading">טוען...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!user) {
        return <div className="error">משתמש לא נמצא</div>;
    }

    const getFitnessLevelText = (level: FitnessLevel): string => {
        switch (level) {
            case FitnessLevel.Beginner:
                return 'מתחיל';
            case FitnessLevel.Intermediate:
                return 'בינוני';
            case FitnessLevel.Advanced:
                return 'מתקדם';
            case FitnessLevel.Professional:
                return 'מקצוען';
            default:
                return 'לא מוגדר';
        }
    };

    return (
        <div className="user-profile">
            <div className="profile-header">
                <img 
                    src={profileImageUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="profile-picture"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/default-avatar.png') {
                            target.src = '/default-avatar.png';
                        }
                    }}
                />
                <div className="profile-info">
                    <h1>{user.firstName} {user.lastName}</h1>
                    <p className="level">רמת כושר: {getFitnessLevelText(user.level)}</p>
                    <p className="join-date">חבר מאז: {new Date(user.dateJoined).toLocaleDateString('he-IL')}</p>
                    <button 
                        className={`follow-button ${user.isFollowing ? 'following' : ''}`}
                        onClick={handleFollowToggle}
                    >
                        {user.isFollowing ? 'הפסק לעקוב' : 'עקוב'}
                    </button>
                </div>
            </div>

            <div className="profile-details">
                <div className="bio-section">
                    <h2>אודות</h2>
                    <p>{user.bio || 'אין תיאור זמין'}</p>
                </div>
                <div className="goals-section">
                    <h2>מטרות</h2>
                    <p>{user.goals || 'אין מטרות זמינות'}</p>
                </div>
            </div>

            <div className="user-posts">
                <h2>פוסטים</h2>
                {posts.length === 0 ? (
                    <p>אין פוסטים זמינים</p>
                ) : (
                    <div className="posts-grid">
                        {posts.map(post => (
                            <PostCard key={post.postId} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile; 