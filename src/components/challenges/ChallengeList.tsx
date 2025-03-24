import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchAllChallenges, fetchUserChallenges } from '../../store/slices/challengeSlice';
import { fetchUserParticipations } from '../../store/slices/challengeParticipantSlice';
import ChallengeCard from './ChallengeCard';
import CreateChallenge from './CreateChallenge';
import CompletedChallenges from './CompletedChallenges';
import './ChallengeList.css';

interface Props {
    userId?: number;
    showCreateChallenge?: boolean;
    filteredChallengeIds?: number[];
    isCreateFormVisible?: boolean;
    onCreateFormVisibilityChange?: (isVisible: boolean) => void;
}

const ChallengeList: React.FC<Props> = ({ userId, showCreateChallenge = false, filteredChallengeIds, isCreateFormVisible = false, onCreateFormVisibilityChange }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { challenges, userChallenges, loading, error } = useSelector((state: RootState) => state.challenges);
    const { userParticipations } = useSelector((state: RootState) => state.challengeParticipants);
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

    useEffect(() => {
        const loadParticipations = async () => {
            if (currentUser?.userId) {
                try {
                    console.log('Loading participations for user:', currentUser.userId);
                    const result = await dispatch(fetchUserParticipations(currentUser.userId));
                    console.log('Participations loaded:', result);
                } catch (error) {
                    console.error('Error loading participations:', error);
                }
            }
        };
        
        loadParticipations();
    }, [dispatch, currentUser?.userId, challenges, userChallenges]);

    const filteredChallenges = useMemo(() => {
        const baseChallenges = activeFilter === 'my' ? userChallenges : challenges;
        console.log('Base challenges:', baseChallenges);
        
        let filtered = baseChallenges;

        // Apply active/inactive filter
        if (showOnlyActive) {
            const now = new Date();
            filtered = filtered.filter(challenge => {
                const startDate = new Date(challenge.startDate);
                const endDate = new Date(challenge.endDate);
                const isActive = startDate <= now && endDate >= now;
                console.log(`Challenge ${challenge.challengeId} (${challenge.title}):`, 
                    { startDate, endDate, now, isActive });
                return isActive;
            });
        }

        // Apply AI recommendations filter if provided
        if (filteredChallengeIds && filteredChallengeIds.length > 0) {
            console.log('Filtering by recommended IDs:', filteredChallengeIds);
            filtered = filtered.filter(challenge => {
                const isRecommended = filteredChallengeIds.includes(challenge.challengeId!);
                console.log(`Challenge ${challenge.challengeId} recommended:`, isRecommended);
                return isRecommended;
            });
        }

        console.log('Final filtered challenges:', filtered);
        return filtered;
    }, [challenges, userChallenges, activeFilter, showOnlyActive, filteredChallengeIds]);

    const challengesWithParticipation = useMemo(() => {
        console.log('Calculating participations with:', {
            currentUser,
            userParticipations,
            filteredChallenges
        });

        if (!currentUser?.userId || !userParticipations.length) {
            return filteredChallenges.map(challenge => ({
                ...challenge,
                isParticipating: false
            }));
        }

        return filteredChallenges.map(challenge => {
            const isParticipating = userParticipations.some(participation => 
                participation.challengeId === challenge.challengeId
            );
            console.log(`Challenge ${challenge.challengeId}: isParticipating = ${isParticipating}`);
            return {
                ...challenge,
                isParticipating
            };
        });
    }, [filteredChallenges, userParticipations, currentUser?.userId]);

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
                {showCreateChallenge && (
                    <button 
                        className="create-challenge-button"
                        onClick={() => onCreateFormVisibilityChange?.(!isCreateFormVisible)}
                    >
                        {isCreateFormVisible ? 'סגור טופס יצירה' : 'יצירת אתגר חדש'}
                    </button>
                )}
            </div>

            {showCreateChallenge && isCreateFormVisible && <CreateChallenge />}

            <div className="challenges-list">
                {challengesWithParticipation.length === 0 ? (
                    <div className="no-challenges">
                        {activeFilter === 'my'
                            ? 'אין לך אתגרים פעילים כרגע'
                            : showOnlyActive 
                                ? 'אין אתגרים פעילים כרגע'
                                : 'אין אתגרים כרגע'}
                    </div>
                ) : (
                    challengesWithParticipation.map(challenge => (
                        <ChallengeCard 
                            key={challenge.challengeId} 
                            challenge={challenge}
                            isCreator={challenge.creatorId === currentUser?.userId}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ChallengeList; 