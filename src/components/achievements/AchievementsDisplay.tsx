import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchAchievements } from '../../store/slices/achievementsSlice';
import './AchievementsDisplay.css';

const AchievementsDisplay: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { achievements, loading, error } = useSelector((state: RootState) => state.achievements);
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);

    useEffect(() => {
        if (currentUser?.userId) {
            dispatch(fetchAchievements(currentUser.userId));
        }
    }, [dispatch, currentUser?.userId]);

    if (loading) {
        return <div className="achievements-loading">טוען הישגים...</div>;
    }

    if (error) {
        return <div className="achievements-error">{error}</div>;
    }

    if (!achievements.length) {
        return (
            <div className="achievements-empty">
                <h2>הישגים</h2>
                <p>אין לך הישגים עדיין</p>
                <p className="sub-text">הצטרף לאתגרים והשלם אותם כדי להרוויח הישגים!</p>
            </div>
        );
    }

    return (
        <div className="achievements-container">
            <h2>הישגים</h2>
            <div className="achievements-grid">
                {achievements.map((achievement) => (
                    <div key={achievement.achievementId} className="achievement-card">
                        <div className="achievement-icon">
                            🏆
                        </div>
                        <div className="achievement-content">
                            <h3>{achievement.title}</h3>
                            <p>{achievement.description}</p>
                            <div className="achievement-date">
                                הושג בתאריך: {new Date(achievement.dateEarned).toLocaleDateString('he-IL')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementsDisplay; 