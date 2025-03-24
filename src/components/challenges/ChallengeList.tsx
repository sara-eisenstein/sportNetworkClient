import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchAllChallenges, fetchUserChallenges } from '../../store/slices/challengeSlice';
import ChallengeCard from './ChallengeCard';
import CreateChallenge from './CreateChallenge';
import CompletedChallenges from './CompletedChallenges';
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
    const [showOnlyActive, setShowOnlyActive] = useState(true);
    const [userChallengesError, setUserChallengesError] = useState<boolean>(false);
    const [showCompleted, setShowCompleted] = useState(false);

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

    const filteredChallenges = useMemo(() => {
        const baseChallenges = activeFilter === 'my' ? userChallenges : challenges;
        
        if (!showOnlyActive) {
            return baseChallenges;
        }

        const now = new Date();
        return baseChallenges.filter(challenge => {
            const startDate = new Date(challenge.startDate);
            const endDate = new Date(challenge.endDate);
            return startDate <= now && endDate >= now;
        });
    }, [challenges, userChallenges, activeFilter, showOnlyActive]);

    if (loading) {
        return <div className="challenges-loading">טוען אתגרים...</div>;
    }

    if (error && !userChallengesError) {
        return <div className="challenges-error">שגיאה בטעינת האתגרים: {error}</div>;
    }

    if (showCompleted) {
        return (
            <div className="challenge-list-container">
                <button 
                    className="view-toggle-button"
                    onClick={() => setShowCompleted(false)}
                >
                    חזרה לאתגרים פעילים
                </button>
                <CompletedChallenges />
            </div>
        );
    }

    return (
        <div className="challenges-container">
            <div className="challenges-toggle">
                <button 
                    onClick={() => setShowOnlyActive(!showOnlyActive)}
                    className={`toggle-button ${showOnlyActive ? 'active' : ''}`}
                >
                    {showOnlyActive ? 'הצג את כל האתגרים' : 'הצג רק אתגרים פעילים'}
                </button>
                {currentUser && (
                    <button 
                        onClick={() => setActiveFilter(activeFilter === 'all' ? 'my' : 'all')}
                        className={`toggle-button ${activeFilter === 'my' ? 'active' : ''}`}
                    >
                        {activeFilter === 'my' ? 'הצג את כל האתגרים' : 'הצג את האתגרים שלי'}
                    </button>
                )}
                <button 
                    className="view-toggle-button"
                    onClick={() => setShowCompleted(true)}
                >
                    הצג אתגרים שהסתיימו
                </button>
            </div>

            {showCreateChallenge && <CreateChallenge />}

            {filteredChallenges.length === 0 ? (
                <div className="no-challenges">
                    {activeFilter === 'my'
                        ? 'אין לך אתגרים פעילים כרגע'
                        : showOnlyActive 
                            ? 'אין אתגרים פעילים כרגע'
                            : 'אין אתגרים כרגע'}
                </div>
            ) : (
                <div className="challenges-list">
                    {filteredChallenges.map(challenge => (
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