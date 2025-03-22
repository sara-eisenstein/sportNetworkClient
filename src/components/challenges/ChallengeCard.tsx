import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { removeChallenge, participateInChallenge, quitChallenge, updateChallengeProgress } from '../../store/slices/challengeSlice';
import { Challenge, ChallengeStatus } from '../../models/challenge';
import { fetchChallengeParticipants } from '../../store/slices/challengeParticipantSlice';
import ParticipantList from './ParticipantList';
import './ChallengeCard.css';

interface Props {
    challenge: Challenge;
    isCreator?: boolean;
}

const ChallengeCard: React.FC<Props> = ({ challenge, isCreator = false }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    const [newProgress, setNewProgress] = useState(challenge.currentProgress || 0);
    const [showParticipants, setShowParticipants] = useState(false);
    
    // קבלת המשתתפים הספציפיים לאתגר הזה
    const participants = useSelector((state: RootState) => 
        state.challengeParticipants.participantsByChallenge[challenge.challengeId!] || []
    );

    useEffect(() => {
        // טעינת רשימת המשתתפים מיד כשהקומפוננטה נטענת
        if (challenge.challengeId) {
            dispatch(fetchChallengeParticipants(challenge.challengeId));
        }
    }, [dispatch, challenge.challengeId]);

    // וידוא שיש פרטי יוצר
    const creatorName = challenge.creatorName || 'משתמש לא ידוע';
    const creatorProfilePicture = challenge.creatorProfilePicture || '/default-avatar.webp';

    const handleDelete = () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק אתגר זה?')) {
            dispatch(removeChallenge(challenge.challengeId!));
        }
    };

    const handleParticipation = () => {
        if (challenge.isParticipating) {
            dispatch(quitChallenge(challenge.challengeId!));
        } else {
            dispatch(participateInChallenge(challenge.challengeId!));
        }
    };

    const handleProgressUpdate = () => {
        if (newProgress >= 0 && newProgress <= challenge.goal) {
            dispatch(updateChallengeProgress({
                challengeId: challenge.challengeId!,
                progress: newProgress
            }));
            setIsUpdatingProgress(false);
        }
    };

    const getStatusColor = () => {
        switch (challenge.status) {
            case ChallengeStatus.Completed:
                return 'status-completed';
            case ChallengeStatus.Failed:
                return 'status-failed';
            default:
                return 'status-active';
        }
    };

    const progressPercentage = ((challenge.currentProgress || 0) / challenge.goal) * 100;

    // Check if the challenge is currently active based on dates
    const currentDate = new Date();
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    const isActive = currentDate >= startDate && currentDate <= endDate;

    return (
        <div className="challenge-card">
            <div className="challenge-header">
                <img 
                    src={creatorProfilePicture}
                    alt={creatorName}
                    className="creator-avatar"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/default-avatar.webp';
                    }}
                />
                <div className="challenge-info">
                    <span className="creator-name" title={creatorName}>{creatorName}</span>
                    <span className={`challenge-status ${getStatusColor()}`}>
                        {challenge.status}
                    </span>
                </div>
                {isCreator && (
                    <button 
                        className="delete-button"
                        onClick={handleDelete}
                    >
                        מחק
                    </button>
                )}
            </div>

            <h3 className="challenge-title">{challenge.title}</h3>
            <p className="challenge-description">{challenge.description}</p>

            <div className="challenge-details">
                <div className="detail-item">
                    <span className="detail-label">תאריך התחלה:</span>
                    <span>{new Date(challenge.startDate).toLocaleDateString('he-IL')}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">תאריך סיום:</span>
                    <span>{new Date(challenge.endDate).toLocaleDateString('he-IL')}</span>
                </div>
            </div>

            <div className="progress-section">
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                </div>
            </div>

            {challenge.isParticipating && isActive && (
                <div className="update-progress">
                    {isUpdatingProgress ? (
                        <div className="progress-update-form">
                            <input
                                type="number"
                                value={Math.round((newProgress / challenge.goal) * 100)}
                                onChange={(e) => setNewProgress((Number(e.target.value) / 100) * challenge.goal)}
                                min="0"
                                max="100"
                            />
                            <span>%</span>
                            <div className="progress-actions">
                                <button onClick={handleProgressUpdate}>עדכן</button>
                                <button onClick={() => setIsUpdatingProgress(false)}>ביטול</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsUpdatingProgress(true)}>
                            עדכן התקדמות
                        </button>
                    )}
                </div>
            )}

            {!isCreator && (
                <button 
                    className={`participation-button ${challenge.isParticipating ? 'participating' : ''}`}
                    onClick={handleParticipation}
                    disabled={!isActive}
                >
                    {challenge.isParticipating ? 'עזוב אתגר' : 'הצטרף לאתגר'}
                </button>
            )}

            <div className="participants-section">
                <button 
                    className="view-participants-button"
                    onClick={() => setShowParticipants(!showParticipants)}
                >
                    {showParticipants ? 'הסתר משתתפים' : 'הצג משתתפים'}
                </button>
                
                <div className="participants-count">
                    {participants.length} משתתפים
                </div>

                {showParticipants && (
                    <ParticipantList 
                        challengeId={challenge.challengeId!}
                    />
                )}
            </div>
        </div>
    );
};

export default ChallengeCard; 