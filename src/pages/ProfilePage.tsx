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
const getFitnessLevelText = (level: FitnessLevel | number): string => {
    // המרת הערך למספר אם הוא לא כבר מספר
    const levelNum = typeof level === 'number' ? level : Number(level);
    
    console.log('Converting fitness level to text:', level, 'as number:', levelNum);
    
    // בדיקה לפי ערך מספרי
    switch (levelNum) {
        case 0:
            return 'מתחיל';
        case 1:
            return 'בינוני';
        case 2:
            return 'מתקדם';
        case 3:
            return 'מקצועי';
        default:
            // אם הערך לא תואם לאף אחד מהערכים המוכרים, ננסה להשתמש ב-enum
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
                    console.warn('Unknown fitness level:', level);
                    return 'לא ידוע';
            }
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
    const { currentUser, loading, error } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        bio: '',
        profilePicture: '',
        goals: '',
        level: FitnessLevel.Beginner,
        passwordHash: '',
        confirmPassword: ''
    });
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isLoadingProfileImage, setIsLoadingProfileImage] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { token } = useSelector((state: RootState) => state.auth);

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
                level: currentUser.level || FitnessLevel.Beginner,
                passwordHash: '',
                confirmPassword: ''
            });
            
            // איפוס ה-preview כאשר יוצאים ממצב עריכה
            if (!isEditing) {
                setPreviewUrl('');
                setProfilePictureFile(null);
                setShowPassword(false);
            }
        }
    }, [currentUser, isEditing]);

    // איפוס הודעת השגיאה כאשר המשתמש מתחיל לערוך
    useEffect(() => {
        if (isEditing) {
            setUpdateError(null);
        }
    }, [isEditing]);

    // פונקציה לטעינת התמונה הקיימת כקובץ
    const fetchExistingProfileImage = async () => {
        if (!currentUser?.userId) return null;
        
        try {
            setIsLoadingProfileImage(true);
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/getUserImage/${currentUser.userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (!response.ok) {
                console.error('Failed to fetch profile image:', response.statusText);
                return null;
            }
            
            const blob = await response.blob();
            // שימוש בסוג הקובץ המקורי מה-Content-Type
            const contentType = response.headers.get('Content-Type') || blob.type;
            // קביעת סיומת הקובץ לפי סוג התוכן
            const extension = contentType.split('/')[1] || '';
            const fileName = `profile_${currentUser.userId}_${Date.now()}.${extension}`;
            
            const file = new File([blob], fileName, { 
                type: contentType,
                lastModified: Date.now()
            });
            
            console.log('Successfully fetched existing profile image:', {
                name: file.name,
                size: file.size,
                type: file.type
            });
            
            return file;
        } catch (error) {
            console.error('Error fetching profile image:', error);
            return null;
        } finally {
            setIsLoadingProfileImage(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateError(null);
        
        // בדיקת תקינות הסיסמה אם המשתמש הזין סיסמה חדשה
        if (formData.passwordHash) {
            if (formData.passwordHash.length < 8) {
                setUpdateError('הסיסמה חייבת להכיל לפחות 8 תווים');
                return;
            }
            
            if (formData.passwordHash !== formData.confirmPassword) {
                setUpdateError('הסיסמאות אינן תואמות');
                return;
            }
        }
        
        try {
            // יצירת אובייקט עם הנתונים לעדכון - רק השדות הבסיסיים
            const updateData: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                bio: formData.bio,
                goals: formData.goals,
                level: Number(formData.level)
            };
            
            // הוספת סיסמה חדשה אם המשתמש הזין אותה
            if (formData.passwordHash) {
                updateData.passwordHash = formData.passwordHash;
            }
            
            // טיפול בתמונת הפרופיל
            if (profilePictureFile) {
                // אם המשתמש בחר תמונה חדשה, נשתמש בה
                updateData.profilePictureFile = profilePictureFile;
                console.log('Using new profile picture file:', profilePictureFile.name);
            } else if (currentUser && currentUser.profilePicture && !currentUser.profilePicture.includes('default-avatar')) {
                // אם אין תמונה חדשה, ננסה לטעון את התמונה הקיימת כקובץ
                console.log('Trying to fetch existing profile image as file...');
                const existingImageFile = await fetchExistingProfileImage();
                
                if (existingImageFile) {
                    updateData.profilePictureFile = existingImageFile;
                    console.log('Using existing profile image as file:', existingImageFile.name);
                } else {
                    console.log('Could not fetch existing profile image, profile picture will not be updated');
                }
            }
            
            console.log('Sending update data:', updateData);
            
            // שליחת הנתונים לעדכון
            const result = await dispatch(updateUserProfile(updateData));
            
            if (updateUserProfile.rejected.match(result)) {
                // אם העדכון נכשל, נציג את השגיאה
                setUpdateError(result.payload as string);
                return;
            }
            
            // סגירת מצב עריכה
            setIsEditing(false);
            setProfilePictureFile(null);
            setPreviewUrl('');
            setShowPassword(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setUpdateError('אירעה שגיאה בעדכון הפרופיל');
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
                        {updateError && (
                            <div className="error-message">
                                {updateError}
                            </div>
                        )}
                        
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

                        <div className="password-section">
                            <button 
                                type="button" 
                                className="toggle-password-button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 'הסתר שדות סיסמה' : 'שנה סיסמה'}
                            </button>
                            
                            {showPassword && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="passwordHash">סיסמה חדשה (השאר ריק אם אינך רוצה לשנות)</label>
                                        <input
                                            type="password"
                                            id="passwordHash"
                                            name="passwordHash"
                                            value={formData.passwordHash}
                                            onChange={handleChange}
                                            minLength={8}
                                        />
                                        <small className="form-hint">הסיסמה חייבת להכיל לפחות 8 תווים</small>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">אימות סיסמה חדשה</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            minLength={8}
                                        />
                                    </div>
                                </>
                            )}
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
                                    setShowPassword(false);
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