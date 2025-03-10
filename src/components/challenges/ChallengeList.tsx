import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchAllChallenges, fetchUserChallenges } from '../../store/slices/challengeSlice';
import ChallengeCard from './ChallengeCard';
import CreateChallenge from './CreateChallenge';
import './ChallengeList.css';

interface Props {
    userId?: number;
    showCreateChallenge?: boolean;
}

const ChallengeList: React.FC<Props> = ({ userId, showCreateChallenge = true }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { challenges, userChallenges, loading, error } = useSelector((state: RootState) => state.challenges);
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserChallenges(userId));
        } else {
            dispatch(fetchAllChallenges());
        }
    }, [dispatch, userId]);

    if (loading) return <div className="challenges-loading">טוען אתגרים...</div>;
    if (error) return <div className="challenges-error">שגיאה: {error}</div>;

    const displayChallenges = userId ? userChallenges : challenges;

    return (
        <div className="challenges-container">
            {showCreateChallenge && <CreateChallenge />}
            
            <div className="challenges-list">
                {displayChallenges.map(challenge => (
                    <ChallengeCard 
                        key={challenge.challengeId} 
                        challenge={challenge}
                        isCreator={currentUser?.userId === challenge.creatorId}
                    />
                ))}
                
                {displayChallenges.length === 0 && (
                    <div className="no-challenges">
                        {userId ? 'אין אתגרים להצגה' : 'עדיין אין אתגרים. היה הראשון ליצור אתגר!'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChallengeList; 