import React from 'react';
import { ChallengeParticipant } from '../../models/challengeParticipant';
import './ParticipantCard.css';

interface Props {
    participant: ChallengeParticipant;
}

const ParticipantCard: React.FC<Props> = ({ participant }) => {
    return (
        <div className="participant-card">
            <div className="participant-header">
                <img 
                    src={participant.profilePicture || '/default-avatar.webp'} 
                    alt={`${participant.firstName} ${participant.lastName}`} 
                    className="participant-avatar"
                />
                <div className="participant-info">
                    <span className="participant-name">{participant.firstName} {participant.lastName}</span>
                    <span className="participant-join-date">
                        הצטרף/ה בתאריך: {new Date(participant.dateJoined).toLocaleDateString('he-IL')}
                    </span>
                </div>
            </div>

            {participant.goals && (
                <div className="participant-goals">
                    <h4>מטרות:</h4>
                    <p>{participant.goals}</p>
                </div>
            )}

            {participant.bio && (
                <div className="participant-bio">
                    <h4>אודות:</h4>
                    <p>{participant.bio}</p>
                </div>
            )}
        </div>
    );
};

export default ParticipantCard; 