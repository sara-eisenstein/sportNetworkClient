import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { Challenge, ChallengeStatus } from '../../models/challenge';
import { updateChallengeProgress, fetchUserChallenges } from '../../store/slices/challengeSlice';
import { addNewAchievement } from '../../store/slices/achievementsSlice';
import './CompletedChallenges.css';

const CompletedChallenges: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const challenges = useSelector((state: RootState) => state.challenges.userChallenges);
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadUserChallenges = async () => {
            // טוען אתגרים רק אם אין לנו אתגרים טעונים
            if (currentUser?.userId && challenges.length === 0) {
                try {
                    console.log('Fetching user challenges for completed challenges view');
                    await dispatch(fetchUserChallenges(currentUser.userId)).unwrap();
                } catch (err) {
                    console.error('Error fetching user challenges:', err);
                    setError('שגיאה בטעינת האתגרים');
                }
            }
        };

        loadUserChallenges();
    }, [currentUser?.userId, dispatch, challenges.length]);

    // Filter completed challenges (past end date)
    const completedChallenges = challenges.filter(challenge => {
        console.log('Checking challenge:', {
            id: challenge.challengeId,
            title: challenge.title,
            endDate: challenge.endDate,
            currentDate: new Date().toISOString()
        });
        
        // Convert endDate to start of day in local timezone
        const endDate = new Date(challenge.endDate);
        endDate.setHours(0, 0, 0, 0);
        
        // Get current date at start of day in local timezone
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        // Check if challenge end date has passed
        const isCompleted = endDate < now;
        
        console.log('Challenge completion status:', {
            challengeId: challenge.challengeId,
            isCompleted,
            endDate: endDate.toISOString(),
            now: now.toISOString()
        });
        
        return isCompleted;
    });

    console.log('Filtered challenges:', {
        totalChallenges: challenges.length,
        completedChallenges: completedChallenges.length,
        completedChallengesList: completedChallenges
    });

    const handleStatusUpdate = async (challengeId: number, newStatus: string, challenge: Challenge) => {
        try {
            setError(null);
            if (!currentUser?.userId) {
                throw new Error('משתמש לא מחובר');
            }
            
            await dispatch(updateChallengeProgress({
                challengeId,
                userId: currentUser.userId,
                progress: newStatus
            }));

            if (newStatus === "true") {
                await dispatch(addNewAchievement({
                    userId: currentUser.userId,
                    title: challenge.title,
                    description: challenge.description,
                    dateEarned: new Date().toISOString()
                }));
            }
        } catch (err) {
            console.error("שגיאה בעדכון סטטוס האתגר:", err);
            setError('שגיאה בעדכון סטטוס האתגר');
        }
    };

    if (error) {
        return (
            <div className="completed-challenges-container error-state">
                <p>{error}</p>
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
                    <p>אין לך אתגרים שהסתיימו</p>
                    <p className="sub-text">האתגרים שלך יופיעו כאן לאחר שיגיע תאריך הסיום שלהם</p>
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