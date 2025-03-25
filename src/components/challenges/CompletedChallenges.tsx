import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { Challenge, ChallengeStatus } from '../../models/challenge';
import { fetchUserChallenges } from '../../store/slices/challengeSlice';
import { addNewAchievement } from '../../store/slices/achievementsSlice';
import { getUserParticipations } from '../../services/challengeParticipantService';
import { ChallengeParticipant } from '../../models/challengeParticipant';
import { updateProgress } from '../../store/slices/challengeParticipantSlice';
import { fetchChallengeParticipants } from '../../store/slices/challengeParticipantSlice';
import './CompletedChallenges.css';

const CompletedChallenges: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const challenges = useSelector((state: RootState) => state.challenges.userChallenges);
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);
    const participantsByChallenge = useSelector((state: RootState) => state.challengeParticipants.participantsByChallenge);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedChallenges = useRef(false);
    const [participations, setParticipations] = useState<ChallengeParticipant[]>([]);

    useEffect(() => {
        const loadUserChallenges = async () => {
            if (currentUser?.userId && challenges.length === 0 && !hasLoadedChallenges.current) {
                try {
                    console.log('Fetching user challenges for completed challenges view');
                    await dispatch(fetchUserChallenges(currentUser.userId)).unwrap();
                    hasLoadedChallenges.current = true;
                } catch (err) {
                    console.error('Error fetching user challenges:', err);
                    setError('שגיאה בטעינת האתגרים');
                }
            }
        };

        const loadParticipations = async () => {
            if (currentUser?.userId) {
                try {
                    const userParticipations = await getUserParticipations(currentUser.userId);
                    setParticipations(userParticipations);
                } catch (err) {
                    console.error('Error fetching user participations:', err);
                    setError('שגיאה בטעינת ההשתתפויות באתגרים');
                }
            }
        };

        loadUserChallenges();
        loadParticipations();
    }, [currentUser?.userId, dispatch]);

    // טעינת המשתתפים לכל אתגר שהסתיים
    useEffect(() => {
        const loadParticipantsForCompletedChallenges = async () => {
            const completedChallenges = challenges.filter(challenge => {
                const endDate = new Date(challenge.endDate);
                endDate.setHours(0, 0, 0, 0);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                return endDate < now;
            });

            for (const challenge of completedChallenges) {
                if (challenge.challengeId && !participantsByChallenge[challenge.challengeId]) {
                    await dispatch(fetchChallengeParticipants(challenge.challengeId));
                }
            }
        };

        loadParticipantsForCompletedChallenges();
    }, [challenges, dispatch, participantsByChallenge]);

    // Filter completed challenges (past end date)
    const completedChallenges = challenges.filter(challenge => {
        const endDate = new Date(challenge.endDate);
        endDate.setHours(0, 0, 0, 0);
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        return endDate < now;
    });

    const getParticipationForChallenge = (challengeId: number): ChallengeParticipant | undefined => {
        return participations.find(p => p.challengeId === challengeId);
    };

    const handleStatusUpdate = async (challengeId: number, newStatus: string, challenge: Challenge) => {
        try {
            setError(null);
            if (!currentUser?.userId) {
                throw new Error('משתמש לא מחובר');
            }
            
            // עדכון ההשתתפות באתגר
            const updatedParticipation = await dispatch(updateProgress({
                challengeId,
                userId: currentUser.userId,
                progress: newStatus
            })).unwrap();

            // הוספת הישג אם האתגר הושלם בהצלחה
            if (newStatus === "true") {
                try {
                    await dispatch(addNewAchievement({
                        userId: currentUser.userId,
                        title: challenge.title,
                        description: challenge.description,
                        dateEarned: new Date().toISOString()
                    })).unwrap();
                } catch (achievementErr) {
                    console.error("שגיאה בהוספת הישג:", achievementErr);
                    // לא נזרוק שגיאה כאן כדי לא לעצור את התהליך
                }
            }

            // רענון ההשתתפויות והאתגרים
            try {
                const updatedParticipations = await getUserParticipations(currentUser.userId);
                setParticipations(updatedParticipations);
                await dispatch(fetchUserChallenges(currentUser.userId)).unwrap();
            } catch (refreshErr) {
                console.error("שגיאה ברענון הנתונים:", refreshErr);
                setError('שגיאה ברענון הנתונים');
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
                {completedChallenges.map(challenge => {
                    const participation = getParticipationForChallenge(challenge.challengeId!);
                    const progress = participation?.progress;
                    const participants = participantsByChallenge[challenge.challengeId!] || [];

                    return (
                        <div key={challenge.challengeId} className="completed-challenge-card">
                            <div className="challenge-participants">
                                {participants.length} משתתפים
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
                            {progress==="." && (
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
                            {progress === "true" && (
                                <div className="status-indicator success">
                                    ✓ הושלם בהצלחה
                                </div>
                            )}
                            {progress === "false" && (
                                <div className="status-indicator failure">
                                    ✗ לא הושלם
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CompletedChallenges;