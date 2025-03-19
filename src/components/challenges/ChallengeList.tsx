import React, { useEffect, useState } from 'react';
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

const ChallengeList: React.FC<Props> = ({ userId, showCreateChallenge = false }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { challenges, loading, error } = useSelector((state: RootState) => state.challenges);
    const { currentUser } = useSelector((state: RootState) => state.auth);
    const [showMyChallenges, setShowMyChallenges] = useState(false);
    const [showAllChallenges, setShowAllChallenges] = useState(true);

    useEffect(() => {
        if (showMyChallenges && currentUser) {
            dispatch(fetchUserChallenges(currentUser.userId));
        } else {
            dispatch(fetchAllChallenges());
        }
    }, [dispatch, showMyChallenges, currentUser]);

    if (loading) {
        return <div className="challenges-loading">טוען אתגרים...</div>;
    }

    if (error) {
        return <div className="challenges-error">שגיאה בטעינת האתגרים: {error}</div>;
    }

    return (
        <div className="challenges-container">
            {showCreateChallenge && <CreateChallenge />}

            {challenges.length === 0 ? (
                <div className="no-challenges">
                    {showMyChallenges 
                        ? 'אין לך אתגרים פעילים כרגע'
                        : 'אין אתגרים פעילים כרגע'}
                </div>
            ) : (
                <div className="challenges-list">
                    {challenges.map(challenge => (
                        <ChallengeCard
                            key={challenge.challengeId}
                            challenge={challenge}
                            isCreator={currentUser?.userId === challenge.creatorId}
                        />
                    ))}
                </div>
            )}

            <div className="challenges-toggle">
                <button 
                    onClick={() => {
                        setShowMyChallenges(false);
                        setShowAllChallenges(!showAllChallenges);
                    }}
                    className={`toggle-button ${showAllChallenges ? 'active' : ''}`}
                >
                    {showAllChallenges ? 'הצג רק אתגרים פעילים' : 'הצג את כל האתגרים'}
                </button>
                {currentUser && (
                    <button 
                        onClick={() => {
                            setShowAllChallenges(false);
                            setShowMyChallenges(!showMyChallenges);
                        }}
                        className={`toggle-button ${showMyChallenges ? 'active' : ''}`}
                    >
                        {showMyChallenges ? 'הצג את כל האתגרים' : 'הצג את האתגרים שלי'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChallengeList; 