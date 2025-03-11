import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { register } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store/store';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, loading, error: authError } = useSelector((state: RootState) => state.auth);
    
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });
    const [error, setError] = useState('');

    // מקבל את המיקום המקורי מה-state, אם קיים
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        if (currentUser) {
            console.log('User registered and logged in, redirecting to:', from);
            navigate(from, { replace: true });
        }
    }, [currentUser, navigate, from]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword || 
            !formData.firstName || !formData.lastName) {
            setError('נא למלא את כל שדות החובה');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            return false;
        }

        if (formData.password.length < 6) {
            setError('הסיסמה חייבת להכיל לפחות 6 תווים');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        try {
            console.log('Submitting registration form...');
            const { confirmPassword, ...registerData } = formData;
            const result = await dispatch(register(registerData)).unwrap();
            console.log('Registration result:', result);
        } catch (err) {
            console.error('Registration error:', err);
            setError('שגיאה בהרשמה. אנא נסה שוב.');
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h2>הרשמה</h2>
                {(error || authError) && (
                    <div className="error-message">
                        {error || authError}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">אימייל *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">שם פרטי *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">שם משפחה *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">מספר טלפון</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">סיסמה *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">אימות סיסמה *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'מבצע הרשמה...' : 'הרשם'}
                    </button>
                </form>
                <div className="login-section">
                    <p>כבר יש לך חשבון?</p>
                    <Link to="/login" className="login-link">התחבר כאן</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage; 