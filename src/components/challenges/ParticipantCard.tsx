import React, { useEffect, useState } from 'react';
import { ChallengeParticipant } from '../../models/challengeParticipant';
import { getUserImage } from '../../services/userService';
import './ParticipantCard.css';

interface Props {
    participant: ChallengeParticipant;
}

const ParticipantCard: React.FC<Props> = ({ participant }) => {
    const [profileImageUrl, setProfileImageUrl] = useState<string>('/default-avatar.webp');

    useEffect(() => {
        const loadProfileImage = async () => {
            try {
                const imageUrl = await getUserImage(participant.userId);
                setProfileImageUrl(imageUrl);
            } catch (error) {
                console.error('Failed to load profile image:', error);
                setProfileImageUrl('/default-avatar.webp');
            }
        };

        loadProfileImage();
    }, [participant.userId]);

    return (
        <div className="participant-card">
            <div className="participant-header">
                <img 
                    src={profileImageUrl}
                    alt={`${participant.firstName} ${participant.lastName}`} 
                    className="participant-avatar"
                />
                <div className="participant-info">
                    <span className="participant-name">{participant.firstName} {participant.lastName}</span>
                </div>
            </div>
        </div>
    );
};

export default ParticipantCard; 