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
        dispatch(updateChallengeProgress({
            challengeId: challenge.challengeId!,
            progress: challenge.progress === "true" ? "false" : "true"
        }));
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

    // Check if the challenge is currently active based on dates
    const currentDate = new Date();
    const startDate = new Date(challenge.startDate);
    const endDate = new Date(challenge.endDate);
    const isActive = currentDate >= startDate && currentDate <= endDate;

    return (
        <div className="challenge-card">
            <div className="participants-count">
                {participants.length} משתתפים
            </div>
            <h3 className="challenge-title">{challenge.title}</h3>
            <p className="challenge-description">{challenge.description}</p>
            
            <div className="challenge-header">
                <span className={`challenge-status ${getStatusColor()}`}>
                    {challenge.status}
                </span>
                {isCreator && (
                    <button 
                        className="delete-button"
                        onClick={handleDelete}
                    >
                        מחק
                    </button>
                )}
            </div>

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
                <div className="progress-status">
                    {challenge.progress === "true" ? 'הושלם ✓' : 'טרם הושלם'}
                </div>
            </div>

            {challenge.isParticipating && isActive && (
                <div className="update-progress">
                    <button onClick={handleProgressUpdate}>
                        {challenge.progress === "true" ? 'בטל השלמה' : 'סמן כהושלם'}
                    </button>
                </div>
            )}

            {!isCreator && !challenge.isParticipating && (
                <button 
                    className="participation-button"
                    onClick={handleParticipation}
                    disabled={!isActive}
                >
                    הצטרף לאתגר
                </button>
            )}

            <div className="participants-section">
                <button 
                    className="view-participants-button"
                    onClick={() => setShowParticipants(!showParticipants)}
                >
                    {showParticipants ? 'הסתר משתתפים' : 'הצג משתתפים'}
                </button>
                
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