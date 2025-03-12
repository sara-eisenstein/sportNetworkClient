import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { register } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store/store';
import { RegisterDto } from '../models/auth';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, loading, error: authError } = useSelector((state: RootState) => state.auth);
    
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        passwordHash: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        bio: '',
        goals: ''
    });
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState('');

    // מקבל את המיקום המקורי מה-state, אם קיים
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        if (currentUser) {
            console.log('User registered and logged in, redirecting to:', from);
            navigate(from, { replace: true });
        }
    }, [currentUser, navigate, from]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        if (!formData.email || !formData.passwordHash || !formData.firstName || !formData.lastName) {
            return 'נא למלא את כל שדות החובה';
        }
        if (formData.passwordHash !== formData.confirmPassword) {
            return 'הסיסמאות אינן תואמות';
        }
        if (formData.passwordHash.length < 6) {
            return 'הסיסמה חייבת להכיל לפחות 6 תווים';
        }
        if (!formData.bio || !formData.goals) {
            return 'נא למלא את שדות הביוגרפיה והיעדים';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting registration form...');

        const validationError = validateForm();
        if (validationError) {
            console.error('Validation error:', validationError);
            setError(validationError);
            return;
        }

        try {
            const registerData: RegisterDto = {
                email: formData.email,
                passwordHash: formData.passwordHash,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
                bio: formData.bio,
                goals: formData.goals,
                profilePicture: profilePicture || undefined
            };

            await dispatch(register(registerData)).unwrap();
            navigate(location.state?.from?.pathname || '/');
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
                            <label htmlFor="passwordHash">סיסמה *</label>
                            <input
                                type="password"
                                id="passwordHash"
                                name="passwordHash"
                                value={formData.passwordHash}
                                onChange={handleChange}
                                required
                                disabled={loading}
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
                        <label htmlFor="profilePicture">תמונת פרופיל</label>
                        <div className="profile-picture-upload">
                            <input
                                type="file"
                                id="profilePicture"
                                name="profilePicture"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                            {previewUrl && (
                                <div className="profile-picture-preview">
                                    <img src={previewUrl} alt="תצוגה מקדימה" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfilePicture(null);
                                            setPreviewUrl(null);
                                        }}
                                    >
                                        הסר תמונה
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">ספר/י לנו קצת על עצמך *</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            required
                            disabled={loading}
                            placeholder="למשל: אני מתאמן/ת כבר שנתיים, אוהב/ת ריצה ויוגה..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="goals">מה היעדים שלך? *</label>
                        <textarea
                            id="goals"
                            name="goals"
                            value={formData.goals}
                            onChange={handleChange}
                            rows={3}
                            required
                            disabled={loading}
                            placeholder="למשל: לרוץ חצי מרתון, לשפר את הכושר הכללי..."
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'מבצע הרשמה...' : 'הרשם'}
                    </button>
                </form>
                <div className="login-section">
                    <p>כבר יש לך חשבון?</p>
                    <Link to="/login" state={{ from: location.state?.from }} className="login-link">
                        התחבר עכשיו
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage; 