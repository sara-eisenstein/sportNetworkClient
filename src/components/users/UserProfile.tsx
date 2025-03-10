import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserById } from "../../store/slices/userSlice";
import { RootState, AppDispatch } from "../../store/store";
import FollowersList from "../followers/FollowersList";
import "../../styles/followers.css";
import "../../styles/profile.css";

interface Props {
  userId: number;
}

const UserProfile: React.FC<Props> = ({ userId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedUser, loading } = useSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  useEffect(() => {
    dispatch(fetchUserById(userId));
  }, [dispatch, userId]);

  if (loading) return <p>Loading...</p>;
  if (!selectedUser) return <p>User not found</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={selectedUser.profilePicture} alt="Profile" className="profile-picture" />
        <div className="profile-info">
          <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
          <p>{selectedUser.bio}</p>
          <p>Email: {selectedUser.email}</p>
          <p>Level: {selectedUser.level}</p>
          <p>Goals: {selectedUser.goals}</p>
        </div>
      </div>

      <div className="followers-tabs">
        <button
          className={`tab-button ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          עוקבים
        </button>
        <button
          className={`tab-button ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          עוקב אחרי
        </button>
      </div>

      <FollowersList userId={userId} type={activeTab} />
    </div>
  );
};

export default UserProfile;
