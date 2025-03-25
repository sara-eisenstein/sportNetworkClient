import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublicUserDto, FitnessLevel, UserDto } from '../models/user';
import { Post } from '../models/post';
import { getPublicUserData, getUserImage, followUser, unfollowUser } from '../services/userService';
import { getUserPosts } from '../services/postService';
import { getFollowers, getFollowersCount } from '../services/followerService';
import PostCard from '../components/posts/PostCard';
import './UserProfile.css';

// פונקציה עזר להמרת רמת כושר למחרוזת בעברית
const getFitnessLevelText = (level: FitnessLevel | number): string => {
    const levelNum = Number(level);
    
    if (levelNum === 0 || levelNum === FitnessLevel.Beginner) {
        return 'מתחיל';
    } else if (levelNum === 1 || levelNum === FitnessLevel.Intermediate) {
        return 'בינוני';
    } else if (levelNum === 2 || levelNum === FitnessLevel.Advanced) {
        return 'מתקדם';
    } else if (levelNum === 3 || levelNum === FitnessLevel.Professional) {
        return 'מקצועי';
    } else {
        return 'לא ידוע';
    }
};

const UserProfile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<PublicUserDto | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string>('/default-avatar.webp');
    const [followersCount, setFollowersCount] = useState<number>(0);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [followers, setFollowers] = useState<UserDto[]>([]);
    const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
    const [followerImages, setFollowerImages] = useState<{ [key: number]: string }>({});

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
                    setProfileImageUrl('/default-avatar.webp');
                }

                const userPosts = await getUserPosts(parseInt(userId));
                setPosts(userPosts);

                // טעינת מספר העוקבים
                const count = await getFollowersCount(parseInt(userId));
                setFollowersCount(count);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'שגיאה בטעינת נתוני המשתמש');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleShowFollowers = async () => {
        if (!userId) return;
        
        try {
            setIsLoadingFollowers(true);
            const followersList = await getFollowers(parseInt(userId));
            setFollowers(followersList);
            
            // טעינת תמונות פרופיל לכל העוקבים
            const imagePromises = followersList.map(async (follower) => {
                try {
                    const imageUrl = await getUserImage(follower.userId);
                    return { userId: follower.userId, imageUrl };
                } catch (error) {
                    console.error(`שגיאה בטעינת תמונת פרופיל לעוקב ${follower.userId}:`, error);
                    return { userId: follower.userId, imageUrl: '/default-avatar.webp' };
                }
            });

            const images = await Promise.all(imagePromises);
            const imagesMap = images.reduce((acc, { userId, imageUrl }) => {
                acc[userId] = imageUrl;
                return acc;
            }, {} as { [key: number]: string });
            
            setFollowerImages(imagesMap);
            setShowFollowersModal(true);
        } catch (err) {
            console.error('שגיאה בטעינת רשימת העוקבים:', err);
        } finally {
            setIsLoadingFollowers(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!user) return;

        try {
            if (user.isFollowing) {
                await unfollowUser(user.userId);
                setUser({ ...user, isFollowing: false });
                setFollowersCount(prev => prev - 1);
            } else {
                await followUser(user.userId);
                setUser({ ...user, isFollowing: true });
                setFollowersCount(prev => prev + 1);
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

    return (
        <div className="user-profile">
            <div className="profile-header">
                <img 
                    src={profileImageUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="profile-picture"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/default-avatar.webp') {
                            target.src = '/default-avatar.webp';
                        }
                    }}
                />
                <div className="profile-info">
                    <h1>{user.firstName} {user.lastName}</h1>
                    <p className="join-date">חבר מאז: {new Date(user.dateJoined).toLocaleDateString('he-IL')}</p>
                    <div className="followers-count" onClick={handleShowFollowers} style={{ cursor: 'pointer' }}>
                        <span>{followersCount} עוקבים</span>
                    </div>
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

            {showFollowersModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setShowFollowersModal(false)}>×</button>
                        <h2>עוקבים</h2>
                        {isLoadingFollowers ? (
                            <div className="loading">טוען...</div>
                        ) : (
                            <div className="followers-list">
                                {followers.map(follower => (
                                    <div key={follower.userId} className="follower-item">
                                        <img 
                                            src={followerImages[follower.userId] || '/default-avatar.webp'} 
                                            alt={`${follower.firstName} ${follower.lastName}`}
                                            className="follower-avatar"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                if (target.src !== '/default-avatar.webp') {
                                                    target.src = '/default-avatar.webp';
                                                }
                                            }}
                                        />
                                        <span>{follower.firstName} {follower.lastName}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile; 