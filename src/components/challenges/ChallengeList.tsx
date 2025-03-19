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
    const { challenges, userChallenges, loading, error } = useSelector((state: RootState) => state.challenges);
    const { currentUser } = useSelector((state: RootState) => state.auth);
    const [activeFilter, setActiveFilter] = useState<'all' | 'my'>('all');
    const [userChallengesError, setUserChallengesError] = useState<boolean>(false);

    useEffect(() => {
        const fetchChallenges = async () => {
            if (activeFilter === 'my' && currentUser) {
                const result = await dispatch(fetchUserChallenges(currentUser.userId));
                if (result.type === fetchUserChallenges.rejected.type) {
                    setUserChallengesError(true);
                } else {
                    setUserChallengesError(false);
                }
            } else {
                dispatch(fetchAllChallenges());
                setUserChallengesError(false);
            }
        };
        
        fetchChallenges();
    }, [dispatch, activeFilter, currentUser]);

    if (loading) {
        return <div className="challenges-loading">טוען אתגרים...</div>;
    }

    if (error && !userChallengesError) {
        return <div className="challenges-error">שגיאה בטעינת האתגרים: {error}</div>;
    }

    const displayedChallenges = activeFilter === 'my' ? userChallenges : challenges;

    return (
        <div className="challenges-container">
            {showCreateChallenge && <CreateChallenge />}

            <div className="challenges-toggle">
                <button 
                    onClick={() => setActiveFilter('all')}
                    className={`toggle-button ${activeFilter === 'all' ? 'active' : ''}`}
                >
                    כל האתגרים
                </button>
                {currentUser && (
                    <button 
                        onClick={() => setActiveFilter('my')}
                        className={`toggle-button ${activeFilter === 'my' ? 'active' : ''}`}
                    >
                        האתגרים שלי
                    </button>
                )}
            </div>

            {(displayedChallenges.length === 0 || (activeFilter === 'my' && userChallengesError)) ? (
                <div className="no-challenges">
                    {activeFilter === 'my'
                        ? 'אין לך אתגרים פעילים כרגע'
                        : 'אין אתגרים פעילים כרגע'}
                </div>
            ) : (
                <div className="challenges-list">
                    {displayedChallenges.map(challenge => (
                        <ChallengeCard
                            key={challenge.challengeId}
                            challenge={challenge}
                            isCreator={currentUser?.userId === challenge.creatorId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChallengeList; 