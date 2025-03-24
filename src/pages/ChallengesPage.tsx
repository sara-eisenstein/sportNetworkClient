import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ChallengeList from '../components/challenges/ChallengeList';
import AchievementsDisplay from '../components/achievements/AchievementsDisplay';
import './ChallengesPage.css';

const ChallengesPage: React.FC = () => {
    const { currentUser } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'challenges' | 'achievements'>('challenges');

    return (
        <div className="challenges-page">
            <header className="challenges-header">
                <h1>אתגרי כושר</h1>
                <p className="challenges-description">
                    {currentUser 
                        ? 'הצטרף לאתגרים קיימים או צור אתגרים חדשים כדי להתקדם ולהתחרות עם חברים!'
                        : 'התחבר כדי להשתתף באתגרים ולהתחרות עם חברים!'}
                </p>
            </header>

            {currentUser && (
                <div className="page-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`}
                        onClick={() => setActiveTab('challenges')}
                    >
                        אתגרים
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
                        onClick={() => setActiveTab('achievements')}
                    >
                        הישגים
                    </button>
                </div>
            )}

            <main className="challenges-main">
                {activeTab === 'challenges' ? (
                    <ChallengeList showCreateChallenge={true} />
                ) : (
                    <AchievementsDisplay />
                )}
            </main>
        </div>
    );
};

export default ChallengesPage; 