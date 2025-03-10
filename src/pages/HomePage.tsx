import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store/store';
import PostList from '../components/posts/PostList';
import ChallengeList from '../components/challenges/ChallengeList';
import './HomePage.css';

const HomePage: React.FC = () => {
    const { currentUser } = useSelector((state: RootState) => state.auth);

    return (
        <div className="home-page">
            <header className="home-header">
                <h1>ברוכים הבאים לרשת החברתית לכושר</h1>
                {currentUser ? (
                    <p className="welcome-message">
                        שלום {currentUser.firstName}, מה חדש בעולם הכושר שלך היום?
                    </p>
                ) : (
                    <div className="guest-message">
                        <p>הצטרף לקהילת הכושר שלנו!</p>
                        <Link to="/login" className="login-link">התחבר עכשיו</Link>
                    </div>
                )}
            </header>

            <div className="home-content">
                <main className="main-content">
                    <section className="posts-section">
                        <h2>עדכונים אחרונים</h2>
                        <PostList showCreatePost={!!currentUser} />
                    </section>
                </main>

                <aside className="side-content">
                    {currentUser ? (
                        <section className="challenges-section">
                            <h2>אתגרים פעילים</h2>
                            <ChallengeList showCreateChallenge={false} />
                        </section>
                    ) : (
                        <section className="login-prompt">
                            <h2>אתגרי כושר</h2>
                            <p>התחבר כדי לראות ולהשתתף באתגרי כושר מרתקים!</p>
                            <ul className="features-list">
                                <li>השתתף באתגרים קבוצתיים</li>
                                <li>עקוב אחר ההתקדמות שלך</li>
                                <li>התחרה עם חברים</li>
                                <li>קבל פרסים ותגים</li>
                            </ul>
                            <Link to="/login" className="login-button">התחבר עכשיו</Link>
                        </section>
                    )}
                </aside>
            </div>
        </div>
    );
};

export default HomePage; 