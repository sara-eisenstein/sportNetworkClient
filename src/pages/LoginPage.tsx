import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import { AppDispatch } from '../store/store';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // מקבל את המיקום המקורי מה-state, אם קיים
    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await dispatch(login({ email, password }));
            // מנווט חזרה לדף המקורי
            navigate(from, { replace: true });
        } catch (err) {
            setError('שם משתמש או סיסמה שגויים');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>התחברות</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">אימייל</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">סיסמה</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">התחבר</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
