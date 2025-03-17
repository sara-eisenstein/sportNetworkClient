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

const ChallengeList: React.FC<Props> = ({ userId, showCreateChallenge = true }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { challenges, userChallenges, loading, error } = useSelector((state: RootState) => state.challenges);
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);
    const [showAllChallenges, setShowAllChallenges] = useState(false);
    const [showMyChallenges, setShowMyChallenges] = useState(false);

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
    
    // Filter challenges based on current date and user participation
    const currentDate = new Date();
    let filteredChallenges = displayChallenges;

    if (!showAllChallenges && !showMyChallenges) {
        // Show only active challenges
        filteredChallenges = displayChallenges.filter(challenge => {
            const startDate = new Date(challenge.startDate);
            const endDate = new Date(challenge.endDate);
            return currentDate >= startDate && currentDate <= endDate;
        });
    } else if (showMyChallenges) {
        // Show only challenges the user is participating in
        filteredChallenges = displayChallenges.filter(challenge => challenge.isParticipating);
    }

    return (
        <div className="challenges-container">
            {showCreateChallenge && <CreateChallenge />}
            
            <div className="challenges-list">
                {filteredChallenges.map(challenge => (
                    <ChallengeCard 
                        key={challenge.challengeId} 
                        challenge={challenge}
                        isCreator={currentUser?.userId === challenge.creatorId}
                    />
                ))}
                
                {filteredChallenges.length === 0 && (
                    <div className="no-challenges">
                        {showMyChallenges 
                            ? 'אין לך אתגרים פעילים כרגע' 
                            : userId 
                                ? 'אין אתגרים להצגה' 
                                : 'עדיין אין אתגרים פעילים. היה הראשון ליצור אתגר!'}
                    </div>
                )}
            </div>

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