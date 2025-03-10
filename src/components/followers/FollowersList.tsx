import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchFollowers, fetchFollowing, fetchFollowerStats, follow, unfollow } from '../../store/slices/followerSlice';
import { UserDto } from '../../models/user';

interface Props {
  userId: number;
  type: 'followers' | 'following';
}

const FollowersList: React.FC<Props> = ({ userId, type }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { followers, following, stats, loading, error } = useSelector((state: RootState) => state.follower);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  useEffect(() => {
    if (type === 'followers') {
      dispatch(fetchFollowers(userId));
    } else {
      dispatch(fetchFollowing(userId));
    }
    dispatch(fetchFollowerStats(userId));
  }, [dispatch, userId, type]);

  const handleFollow = async (followedUserId: number) => {
    await dispatch(follow(followedUserId));
    dispatch(fetchFollowerStats(userId));
  };

  const handleUnfollow = async (followedUserId: number) => {
    await dispatch(unfollow(followedUserId));
    dispatch(fetchFollowerStats(userId));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const users = type === 'followers' ? followers : following;

  return (
    <div className="followers-container">
      <div className="followers-stats">
        <div>
          <strong>עוקבים: </strong>
          {stats?.followersCount || 0}
        </div>
        <div>
          <strong>עוקב אחרי: </strong>
          {stats?.followingCount || 0}
        </div>
      </div>
      
      <div className="followers-list">
        {users.map((user: UserDto) => (
          <div key={user.userId} className="follower-item">
            <img src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} className="profile-picture" />
            <div className="follower-info">
              <h3>{user.firstName} {user.lastName}</h3>
              <p>{user.bio}</p>
            </div>
            {currentUser && currentUser.userId !== user.userId && (
              <button
                onClick={() => user.isFollowing ? handleUnfollow(user.userId) : handleFollow(user.userId)}
                className={`follow-button ${user.isFollowing ? 'following' : ''}`}
              >
                {user.isFollowing ? 'הפסק לעקוב' : 'עקוב'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowersList; 