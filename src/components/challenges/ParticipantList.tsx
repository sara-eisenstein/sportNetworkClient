import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchChallengeParticipants } from '../../store/slices/challengeParticipantSlice';
import { ChallengeParticipant } from '../../models/challengeParticipant';
import ParticipantCard from './ParticipantCard';
import './ParticipantList.css';

interface Props {
    challengeId: number;
}

const ParticipantList: React.FC<Props> = ({ challengeId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { participantsByChallenge, loading, error } = useSelector((state: RootState) => state.challengeParticipants);
    const participants = participantsByChallenge[challengeId] || [];

    useEffect(() => {
        dispatch(fetchChallengeParticipants(challengeId));
    }, [dispatch, challengeId]);

    if (loading) return <div className="participants-loading">טוען משתתפים...</div>;
    if (error) return <div className="participants-error">שגיאה: {error}</div>;

    return (
        <div className="participants-container">
            <h3>משתתפים באתגר</h3>
            
            <div className="participants-list">
                {participants.map((participant: ChallengeParticipant) => (
                    <ParticipantCard 
                        key={participant.userId} 
                        participant={participant}
                    />
                ))}
                
                {participants.length === 0 && (
                    <div className="no-participants">
                        עדיין אין משתתפים באתגר זה
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParticipantList; 