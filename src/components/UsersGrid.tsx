import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { UserDto } from '../models/user';
import { getUsers, getUserImage } from '../services/userService';
import { getFollowing } from '../services/followerService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import '../styles/UsersGrid.css';

interface UsersGridProps {
    searchTerm: string;
}

const UsersGrid: React.FC<UsersGridProps> = ({ searchTerm }) => {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOnlyFollowing, setShowOnlyFollowing] = useState(false);
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                let fetchedUsers: UserDto[] = [];

                if (showOnlyFollowing && currentUser) {
                    try {
                        fetchedUsers = await getFollowing(currentUser.userId);
                    } catch (err: any) {
                        if (err.response?.status === 404) {
                            setError('אין משתמשים שאתה עוקב אחריהם');
                            setUsers([]);
                            return;
                        }
                        throw err;
                    }
                } else {
                    fetchedUsers = await getUsers();
                }
                
                // Fetch profile images for all users
                const usersWithImages = await Promise.all(
                    fetchedUsers.map(async (user) => {
                        try {
                            const imageUrl = await getUserImage(user.userId);
                            return { ...user, profilePicture: imageUrl };
                        } catch (error) {
                            console.error(`Error fetching image for user ${user.userId}:`, error);
                            return { ...user, profilePicture: '/default-avatar.webp' };
                        }
                    })
                );
                
                setUsers(usersWithImages);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'שגיאה בטעינת המשתמשים');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [showOnlyFollowing, currentUser]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        
        const searchTermLower = searchTerm.toLowerCase();
        return users.filter(user => 
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTermLower)
        );
    }, [users, searchTerm]);

    if (loading) {
        return <div className="users-grid-loading">טוען משתמשים...</div>;
    }

    if (error) {
        return <div className="users-grid-error">{error}</div>;
    }

    return (
        <div className="users-grid-container">
            <div className="users-grid-header">
                <h1 className="users-grid-title">משתמשים</h1>
                {currentUser && (
                    <div className="filter-container">
                        <label className="filter-label">
                            <input
                                type="checkbox"
                                checked={showOnlyFollowing}
                                onChange={(e) => setShowOnlyFollowing(e.target.checked)}
                            />
                            הצג רק משתמשים שאני עוקב אחריהם
                        </label>
                    </div>
                )}
            </div>
            {filteredUsers.length === 0 ? (
                <div className="no-results">לא נמצאו משתמשים התואמים את החיפוש</div>
            ) : (
                <div className="users-grid">
                    {filteredUsers.map((user) => (
                        <Link 
                            to={`/user/${user.userId}`} 
                            key={user.userId} 
                            className="user-card"
                        >
                            <div className="user-image-container">
                                <img 
                                    src={user.profilePicture || '/default-avatar.webp'} 
                                    alt={`${user.firstName} ${user.lastName}`} 
                                    className="user-image"
                                />
                            </div>
                            <div className="user-name">
                                {user.firstName} {user.lastName}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UsersGrid; 