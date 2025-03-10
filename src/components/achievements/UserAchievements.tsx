import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAchievements, removeAchievement } from "../../store/slices/achievementsSlice";
import { RootState, AppDispatch } from "../../store/store";

interface Props {
  userId: number;
}

const UserAchievements: React.FC<Props> = ({ userId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { achievements, loading, error } = useSelector((state: RootState) => state.achievements);

  useEffect(() => {
    dispatch(fetchAchievements(userId));
  }, [dispatch, userId]);

  const handleDelete = (id: number) => {
    dispatch(removeAchievement(id));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!achievements.length) return <p>No achievements found.</p>;

  return (
    <div>
      <h2>User Achievements</h2>
      <ul>
        {achievements.map((ach) => (
          <li key={ach.achievementId}>
            <strong>{ach.title}</strong>: {ach.description}
            <button onClick={() => handleDelete(ach.achievementId!)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserAchievements;
