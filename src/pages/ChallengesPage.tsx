import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ChallengeList from '../components/challenges/ChallengeList';
import AchievementsDisplay from '../components/achievements/AchievementsDisplay';
import { getRecommendedChallenges } from '../services/challengeRecommendationService';
import './ChallengesPage.css';

const ChallengesPage: React.FC = () => {
    const { currentUser, token } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'challenges' | 'achievements'>('challenges');
    const [aiPrompt, setAiPrompt] = useState('');
    const [recommendedChallengeIds, setRecommendedChallengeIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);

    const handleAiRecommendation = async () => {
        if (!aiPrompt.trim() || !token) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const ids = await getRecommendedChallenges(aiPrompt, token);
            setRecommendedChallengeIds(ids);
        } catch (err) {
            console.error('Failed to get recommendations:', err);
            setError('שגיאה בקבלת המלצות. אנא נסה שוב.');
        } finally {
            setIsLoading(false);
        }
    };

    const clearRecommendations = () => {
        setRecommendedChallengeIds([]);
        setAiPrompt('');
        setError(null);
    };

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
                <>
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

                    {activeTab === 'challenges' && (
                        <>
                            <div className="ai-recommendation-section">
                                <h2 className="ai-title">🤖 חיפוש חכם באמצעות בינה מלאכותית</h2>
                                <div className="ai-input-container">
                                    <input
                                        type="text"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="תאר את סוג האתגר שאתה מחפש... (לדוגמה: 'ריצה קלה', 'אימון כוח')"
                                        className="ai-input"
                                        disabled={isLoading}
                                    />
                                    <span className="ai-input-icon">🔍</span>
                                    <button 
                                        onClick={handleAiRecommendation}
                                        disabled={isLoading || !aiPrompt.trim()}
                                        className="ai-button"
                                    >
                                        {isLoading ? '🤔 מחפש...' : '🎯 מצא אתגרים מותאמים אישית'}
                                    </button>
                                    {recommendedChallengeIds.length > 0 && (
                                        <button 
                                            onClick={clearRecommendations}
                                            className="clear-button"
                                        >
                                            ❌ נקה סינון
                                        </button>
                                    )}
                                </div>
                                {error && <div className="ai-error">{error}</div>}
                            </div>
                        </>
                    )}
                </>
            )}

            <main className="challenges-main">
                {activeTab === 'challenges' ? (
                    <ChallengeList 
                        showCreateChallenge={true} 
                        filteredChallengeIds={recommendedChallengeIds}
                        isCreateFormVisible={isCreateFormVisible}
                        onCreateFormVisibilityChange={setIsCreateFormVisible}
                    />
                ) : (
                    <AchievementsDisplay />
                )}
            </main>
        </div>
    );
};

export default ChallengesPage; 