import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ChallengeList from '../components/challenges/ChallengeList';
import './ChallengesPage.css';

const ChallengesPage: React.FC = () => {
    const { currentUser } = useSelector((state: RootState) => state.auth);

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

            <main className="challenges-main">
                <ChallengeList showCreateChallenge={true} />
            </main>
        </div>
    );
};

export default ChallengesPage; 