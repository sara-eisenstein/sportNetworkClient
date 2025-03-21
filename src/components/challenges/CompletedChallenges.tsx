import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { Challenge, ChallengeStatus } from '../../models/challenge';
import { fetchUserChallenges, updateChallengeProgress } from '../../store/slices/challengeSlice';
import './CompletedChallenges.css';

const CompletedChallenges: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const challenges = useSelector((state: RootState) => state.challenges.userChallenges);
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadChallenges = async () => {
            if (!currentUser?.userId) return;
            setLoading(true);
            await dispatch(fetchUserChallenges(currentUser.userId));
            setLoading(false);
        };
        loadChallenges();
    }, [dispatch, currentUser?.userId]);

    // Filter completed challenges (past end date)
    const completedChallenges = challenges.filter(challenge => {
        const endDate = new Date(challenge.endDate);
        const now = new Date();
        return endDate < now && challenge.isParticipating;
    });

    const handleStatusUpdate = async (challengeId: number, succeeded: boolean) => {
        // If succeeded is true, set progress to 100%, otherwise keep current progress
        const progress = succeeded ? 100 : (challenges.find(c => c.challengeId === challengeId)?.currentProgress || 0);
        
        await dispatch(updateChallengeProgress({
            challengeId,
            progress
        }));
    };

    if (loading) {
        return <div className="completed-challenges-container">טוען...</div>;
    }

    if (!currentUser) {
        return <div className="completed-challenges-container">יש להתחבר כדי לצפות באתגרים שהסתיימו</div>;
    }

    if (completedChallenges.length === 0) {
        return <div className="completed-challenges-container">אין אתגרים שהסתיימו</div>;
    }

    return (
        <div className="completed-challenges-container">
            <h2>אתגרים שהסתיימו</h2>
            <div className="challenges-grid">
                {completedChallenges.map(challenge => (
                    <div key={challenge.challengeId} className="completed-challenge-card">
                        <h3>{challenge.title}</h3>
                        <p>{challenge.description}</p>
                        <div className="challenge-dates">
                            <span>התחלה: {new Date(challenge.startDate).toLocaleDateString('he-IL')}</span>
                            <span>סיום: {new Date(challenge.endDate).toLocaleDateString('he-IL')}</span>
                        </div>
                        <div className="challenge-progress">
                            <span>התקדמות: {challenge.currentProgress || 0}/{challenge.goal} {challenge.unit}</span>
                        </div>
                        {challenge.status !== ChallengeStatus.Completed && challenge.status !== ChallengeStatus.Failed && (
                            <div className="status-buttons">
                                <button 
                                    className="success-button"
                                    onClick={() => handleStatusUpdate(challenge.challengeId!, true)}
                                >
                                    ✓ עמדתי באתגר
                                </button>
                                <button 
                                    className="failure-button"
                                    onClick={() => handleStatusUpdate(challenge.challengeId!, false)}
                                >
                                    ✗ לא עמדתי באתגר
                                </button>
                            </div>
                        )}
                        {challenge.status === ChallengeStatus.Completed && (
                            <div className="status-indicator success">
                                ✓ הושלם בהצלחה
                            </div>
                        )}
                        {challenge.status === ChallengeStatus.Failed && (
                            <div className="status-indicator failure">
                                ✗ לא הושלם
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompletedChallenges; 