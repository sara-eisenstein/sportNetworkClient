import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { removeChallenge, participateInChallenge, quitChallenge, updateChallengeProgress } from '../../store/slices/challengeSlice';
import { Challenge, ChallengeStatus } from '../../models/challenge';
import './ChallengeCard.css';

interface Props {
    challenge: Challenge;
    isCreator?: boolean;
}

const ChallengeCard: React.FC<Props> = ({ challenge, isCreator = false }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    const [newProgress, setNewProgress] = useState(challenge.currentProgress || 0);

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

    return (
        <div className="challenge-card">
            <div className="challenge-header">
                <img 
                    src={challenge.creatorProfilePicture || '/default-avatar.png'} 
                    alt={challenge.creatorName} 
                    className="creator-avatar"
                />
                <div className="challenge-info">
                    <span className="creator-name">{challenge.creatorName}</span>
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
                    <span className="detail-label">סוג:</span>
                    <span>{challenge.type}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">יעד:</span>
                    <span>{challenge.goal} {challenge.unit}</span>
                </div>
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
                <span className="progress-text">
                    {challenge.currentProgress || 0} / {challenge.goal} {challenge.unit}
                </span>
            </div>

            {challenge.isParticipating && challenge.status === ChallengeStatus.Active && (
                <div className="update-progress">
                    {isUpdatingProgress ? (
                        <div className="progress-update-form">
                            <input
                                type="number"
                                value={newProgress}
                                onChange={(e) => setNewProgress(Number(e.target.value))}
                                min="0"
                                max={challenge.goal}
                            />
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
                    disabled={challenge.status !== ChallengeStatus.Active}
                >
                    {challenge.isParticipating ? 'עזוב אתגר' : 'הצטרף לאתגר'}
                </button>
            )}

            <div className="participants-count">
                {challenge.participantsCount} משתתפים
            </div>
        </div>
    );
};

export default ChallengeCard; 