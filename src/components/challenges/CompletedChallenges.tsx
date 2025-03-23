import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { Challenge, ChallengeStatus } from '../../models/challenge';
import { fetchUserChallenges, updateChallengeProgress } from '../../store/slices/challengeSlice';
import { addNewAchievement } from '../../store/slices/achievementsSlice';
import './CompletedChallenges.css';

const CompletedChallenges: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const challenges = useSelector((state: RootState) => state.challenges.userChallenges);
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadChallenges = useCallback(async () => {
        if (!currentUser?.userId) return;
        try {
            setLoading(true);
            setError(null);
            await dispatch(fetchUserChallenges(currentUser.userId));
        } catch (err) {
            setError('שגיאה בטעינת האתגרים');
            console.error('Error loading challenges:', err);
        } finally {
            setLoading(false);
        }
    }, [dispatch, currentUser?.userId]);

    useEffect(() => {
        loadChallenges();
    }, [loadChallenges]);

    // Filter completed challenges (past end date and has status)
    const completedChallenges = challenges.filter(challenge => {
        const endDate = new Date(challenge.endDate);
        const now = new Date();
        return endDate < now && (challenge.status === ChallengeStatus.Completed || challenge.status === ChallengeStatus.Failed);
    });

    const handleStatusUpdate = async (challengeId: number, newStatus: string, challenge: Challenge) => {
        try {
            setError(null);
            await dispatch(updateChallengeProgress({
                challengeId,
                progress: newStatus
            }));

            if (newStatus === "true" && currentUser?.userId) {
                await dispatch(addNewAchievement({
                    userId: currentUser.userId,
                    title: challenge.title,
                    description: challenge.description,
                    dateEarned: new Date().toISOString()
                }));
            }
        } catch (err) {
            setError('שגיאה בעדכון סטטוס האתגר');
            console.error("Error updating challenge status:", err);
        }
    };

    if (loading) {
        return <div className="completed-challenges-container">טוען...</div>;
    }

    if (error) {
        return (
            <div className="completed-challenges-container error-state">
                <p>{error}</p>
                <button onClick={loadChallenges} className="retry-button">נסה שוב</button>
            </div>
        );
    }

    if (!currentUser) {
        return <div className="completed-challenges-container">יש להתחבר כדי לצפות באתגרים שהסתיימו</div>;
    }

    if (completedChallenges.length === 0) {
        return (
            <div className="completed-challenges-container">
                <h2>אתגרים שהסתיימו</h2>
                <div className="empty-state">
                    <p>אין עדיין אתגרים שהסתיימו</p>
                    <p className="sub-text">האתגרים יופיעו כאן לאחר שיגיע תאריך הסיום שלהם</p>
                </div>
            </div>
        );
    }

    return (
        <div className="completed-challenges-container">
            <h2>אתגרים שהסתיימו</h2>
            <div className="challenges-grid">
                {completedChallenges.map(challenge => (
                    <div key={challenge.challengeId} className="completed-challenge-card">
                        <div className="challenge-participants">
                            {challenge.participantsCount || 0} משתתפים
                        </div>
                        <h3>{challenge.title}</h3>
                        <p>{challenge.description}</p>
                        <div className="challenge-dates">
                            <span>התחלה: {new Date(challenge.startDate).toLocaleDateString('he-IL')}</span>
                            <span>סיום: {new Date(challenge.endDate).toLocaleDateString('he-IL')}</span>
                        </div>
                        <div className="challenge-level">
                            <span>רמת קושי: {challenge.level}</span>
                        </div>
                        <div className="challenge-progress">
                            <span>סטטוס: {challenge.progress === "true" ? 'הושלם' : 'טרם הושלם'}</span>
                        </div>
                        {(!challenge.status || (challenge.status !== ChallengeStatus.Completed && challenge.status !== ChallengeStatus.Failed)) && (
                            <div className="status-buttons">
                                <button 
                                    className="success-button"
                                    onClick={() => handleStatusUpdate(challenge.challengeId!, "true", challenge)}
                                >
                                    ✓ עמדתי באתגר
                                </button>
                                <button 
                                    className="failure-button"
                                    onClick={() => handleStatusUpdate(challenge.challengeId!, "false", challenge)}
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