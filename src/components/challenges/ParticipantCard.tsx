import React from 'react';
import { ChallengeParticipant } from '../../models/challengeParticipant';
import { ChallengeStatus } from '../../models/challenge';
import './ParticipantCard.css';

interface Props {
    participant: ChallengeParticipant;
    goal: number;
    unit: string;
}

const ParticipantCard: React.FC<Props> = ({ participant, goal, unit }) => {
    const progressPercentage = (participant.currentProgress / goal) * 100;

    const getStatusColor = () => {
        switch (participant.status) {
            case ChallengeStatus.Completed:
                return 'status-completed';
            case ChallengeStatus.Failed:
                return 'status-failed';
            default:
                return 'status-active';
        }
    };

    return (
        <div className="participant-card">
            <div className="participant-header">
                <img 
                    src={participant.userProfilePicture || '/default-avatar.webp'} 
                    alt={participant.userName} 
                    className="participant-avatar"
                />
                <div className="participant-info">
                    <span className="participant-name">{participant.userName}</span>
                    <span className={`participant-status ${getStatusColor()}`}>
                        {participant.status}
                    </span>
                </div>
            </div>

            <div className="participant-progress">
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                </div>
                <span className="progress-text">
                    {participant.currentProgress} / {goal} {unit}
                </span>
            </div>

            <div className="participant-dates">
                <div className="date-item">
                    <span className="date-label">הצטרף/ה:</span>
                    <span>{new Date(participant.joinDate).toLocaleDateString('he-IL')}</span>
                </div>
                <div className="date-item">
                    <span className="date-label">עדכון אחרון:</span>
                    <span>{new Date(participant.lastUpdateDate).toLocaleDateString('he-IL')}</span>
                </div>
            </div>
        </div>
    );
};

export default ParticipantCard; 