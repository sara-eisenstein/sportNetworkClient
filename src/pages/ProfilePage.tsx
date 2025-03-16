import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { UserDto, FitnessLevel } from '../models/user';
import { updateUserProfile } from '../store/slices/authSlice';
import './ProfilePage.css';

// הוספת הצהרה על טיפוס File כדי לוודא שהוא מוכר
declare global {
    interface Window {
        File: typeof File;
    }
}

// פונקציה עזר לקבלת נתיב תמונת פרופיל
const getProfileImageUrl = (userId: number | string) => {
    return `${process.env.REACT_APP_API_URL}/getUserImage/${userId}?timestamp=${new Date().getTime()}`;
};

// פונקציה עזר להמרת רמת כושר למחרוזת בעברית
const getFitnessLevelText = (level: FitnessLevel): string => {
    switch (level) {
        case FitnessLevel.Beginner:
            return 'מתחיל';
        case FitnessLevel.Intermediate:
            return 'בינוני';
        case FitnessLevel.Advanced:
            return 'מתקדם';
        case FitnessLevel.Professional:
            return 'מקצועי';
        default:
            return 'לא ידוע';
    }
};

// קומפוננטה לבחירת רמת כושר - ניתן לשימוש חוזר בדפי הרשמה ופרופיל
interface FitnessLevelSelectorProps {
    value: FitnessLevel;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    label?: string;
}

export const FitnessLevelSelector: React.FC<FitnessLevelSelectorProps> = ({
    value,
    onChange,
    required = false,
    label = 'רמת כושר'
}) => {
    return (
        <div className="form-group">
            <label htmlFor="level">{label}</label>
            <select
                id="level"
                name="level"
                value={value}
                onChange={onChange}
                required={required}
                className="fitness-level-select"
            >
                <option value={FitnessLevel.Beginner}>מתחיל</option>
                <option value={FitnessLevel.Intermediate}>בינוני</option>
                <option value={FitnessLevel.Advanced}>מתקדם</option>
                <option value={FitnessLevel.Professional}>מקצועי</option>
            </select>
        </div>
    );
};

const ProfilePage: React.FC = () => {
    const { currentUser, loading } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        bio: '',
        profilePicture: '',
        goals: '',
        level: FitnessLevel.Beginner
    });
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // עדכון נתוני הטופס כאשר המשתמש הנוכחי משתנה
    useEffect(() => {
        if (currentUser) {
            setFormData({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                email: currentUser.email || '',
                bio: currentUser.bio || '',
                profilePicture: currentUser.profilePicture || '',
                goals: currentUser.goals || '',
                level: currentUser.level || FitnessLevel.Beginner
            });
            
            // איפוס ה-preview כאשר יוצאים ממצב עריכה
            if (!isEditing) {
                setPreviewUrl('');
            }
        }
    }, [currentUser, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // יצירת אובייקט עם הנתונים לעדכון
            const updateData: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                bio: formData.bio,
                goals: formData.goals,
                level: formData.level
            };
            
            // אם יש קובץ תמונה חדש, נוסיף אותו לנתונים
            if (profilePictureFile) {
                updateData.profilePictureFile = profilePictureFile;
            }
            
            // שליחת הנתונים לעדכון
            await dispatch(updateUserProfile(updateData));
            
            // סגירת מצב עריכה
            setIsEditing(false);
            setProfilePictureFile(null);
            setPreviewUrl('');
        } catch (error) {
            console.error('Error updating profile:', error);
            // כאן אפשר להוסיף הודעת שגיאה למשתמש
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // שמירת הקובץ לשליחה לשרת
            const file = e.target.files[0];
            setProfilePictureFile(file);
            
            // יצירת URL מקומי לתצוגה מקדימה
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        }
    };

    if (!currentUser) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <h1>פרופיל משתמש</h1>
                    <p>אנא התחבר כדי לצפות בפרופיל שלך.</p>
                </div>
            </div>
        );
    }

    // נתיב תמונת הפרופיל - משתמש בתצוגה מקדימה אם יש, אחרת בנתיב ה-API
    const profileImageSrc = previewUrl || getProfileImageUrl(currentUser.userId);

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1>הפרופיל שלי</h1>
                
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="profile-picture-section">
                            <div className="profile-picture-container">
                                <img 
                                    src={profileImageSrc} 
                                    alt="תמונת פרופיל" 
                                    className="profile-picture"
                                    onError={(e) => {
                                        // אם יש שגיאה בטעינת התמונה, נציג תמונת ברירת מחדל
                                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                                    }}
                                />
                                <label htmlFor="profile-picture-upload" className="upload-button">
                                    שנה תמונה
                                </label>
                                <input 
                                    type="file" 
                                    id="profile-picture-upload" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="firstName">שם פרטי</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastName">שם משפחה</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">אימייל</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <FitnessLevelSelector
                            value={formData.level}
                            onChange={handleChange}
                            required={true}
                        />

                        <div className="form-group">
                            <label htmlFor="goals">מטרות כושר</label>
                            <textarea
                                id="goals"
                                name="goals"
                                value={formData.goals}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bio">אודות</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="save-button"
                                disabled={loading}
                            >
                                {loading ? 'שומר שינויים...' : 'שמור שינויים'}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setProfilePictureFile(null);
                                    setPreviewUrl('');
                                }}
                                disabled={loading}
                            >
                                ביטול
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-view">
                        <div className="profile-picture-section">
                            <img 
                                src={getProfileImageUrl(currentUser.userId)} 
                                alt="תמונת פרופיל" 
                                className="profile-picture"
                                onError={(e) => {
                                    // אם יש שגיאה בטעינת התמונה, נציג תמונת ברירת מחדל
                                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                                }}
                            />
                        </div>

                        <div className="profile-details">
                            <div className="detail-item">
                                <span className="detail-label">שם מלא:</span>
                                <span className="detail-value">
                                    {currentUser.firstName} {currentUser.lastName}
                                </span>
                            </div>
                            
                            <div className="detail-item">
                                <span className="detail-label">אימייל:</span>
                                <span className="detail-value">{currentUser.email}</span>
                            </div>
                            
                            <div className="detail-item">
                                <span className="detail-label">רמת כושר:</span>
                                <span className="detail-value">
                                    {getFitnessLevelText(currentUser.level)}
                                </span>
                            </div>
                            
                            {currentUser.goals && (
                                <div className="detail-item">
                                    <span className="detail-label">מטרות כושר:</span>
                                    <p className="detail-value">{currentUser.goals}</p>
                                </div>
                            )}
                            
                            {currentUser.bio && (
                                <div className="detail-item">
                                    <span className="detail-label">אודות:</span>
                                    <p className="detail-value bio">{currentUser.bio}</p>
                                </div>
                            )}
                            
                            <div className="detail-item">
                                <span className="detail-label">הצטרף בתאריך:</span>
                                <span className="detail-value">
                                    {new Date(currentUser.dateJoined).toLocaleDateString('he-IL')}
                                </span>
                            </div>

                            <button 
                                className="edit-profile-button"
                                onClick={() => setIsEditing(true)}
                            >
                                ערוך פרופיל
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage; 