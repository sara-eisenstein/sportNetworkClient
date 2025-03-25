import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProfilePage from '../pages/ProfilePage';
import UserProfile from '../pages/UserProfile';
import ChallengesPage from '../pages/ChallengesPage';
import ProfilesPage from '../pages/ProfilesPage';
import ChatPage from '../pages/ChatPage';
import PrivateRoute from '../components/auth/PrivateRoute';

// Placeholder components - יש להחליף אותם בקומפוננטים האמיתיים
const WorkoutsPage = () => <div>Workouts Page</div>;

const AppRoutes: React.FC = () => {
    const { currentUser } = useSelector((state: RootState) => state.auth);

    return (
        <Routes>
            {/* ניתובים ציבוריים */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={
                currentUser ? <Navigate to="/" replace /> : <LoginPage />
            } />
            <Route path="/register" element={
                currentUser ? <Navigate to="/" replace /> : <RegisterPage />
            } />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/profiles" element={<ProfilesPage />} />

            {/* ניתובים מאובטחים */}
            <Route path="/profile" element={
                <PrivateRoute>
                    <ProfilePage />
                </PrivateRoute>
            } />
            
            <Route path="/challenges" element={
                <PrivateRoute>
                    <ChallengesPage />
                </PrivateRoute>
            } />
            
            <Route path="/chat" element={
                <PrivateRoute>
                    <ChatPage />
                </PrivateRoute>
            } />
            
            <Route path="/workouts" element={
                <PrivateRoute>
                    <WorkoutsPage />
                </PrivateRoute>
            } />

            {/* ניתוב ברירת מחדל - מפנה לדף הבית */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes; 