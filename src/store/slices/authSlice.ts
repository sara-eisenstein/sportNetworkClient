import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { LoginDto, RegisterDto, AuthResponse } from '../../models/auth';
import { UserDto, FitnessLevel } from '../../models/user';

interface AuthState {
    currentUser: UserDto | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    shouldRegister: boolean;
}

const initialState: AuthState = {
    currentUser: null,
    token: null,
    loading: false,
    error: null,
    shouldRegister: false
};

function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
    }
}

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginDto, { rejectWithValue }) => {
        try {
            console.log('Attempting login...', process.env.REACT_APP_API_URL);
            const response = await axios.post<AuthResponse>(
                `${process.env.REACT_APP_API_URL}/api/Login`,
                credentials
            );
            
            console.log('Login response:', response.data);
            const token = response.data.token;
            
            // שמירת הטוקן ב-localStorage
            localStorage.setItem('token', token);

            // פענוח הטוקן לקבלת פרטי המשתמש
            const tokenData = parseJwt(token);
            console.log('Token data:', tokenData);

            if (!tokenData) {
                return rejectWithValue({ message: 'שגיאה בפענוח פרטי המשתמש', shouldRegister: false });
            }

            const user: UserDto = {
                userId: parseInt(tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
                firstName: tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                lastName: tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || '',
                email: tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                bio: '',
                profilePicture: '/default-avatar.webp',
                level: FitnessLevel.Beginner,
                goals: '',
                dateJoined: new Date().toISOString(),
                status: true
            };

            // לאחר התחברות מוצלחת, נשלוף את פרטי המשתמש המלאים מהשרת
            try {
                const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/User/${user.userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (userResponse.data) {
                    // עדכון פרטי המשתמש עם המידע המלא מהשרת
                    Object.assign(user, userResponse.data);
                }
            } catch (error) {
                console.error('Failed to fetch user details:', error);
                // נמשיך עם פרטי המשתמש הבסיסיים מהטוקן
            }

            return {
                token,
                user
            };
        } catch (error: any) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            
            // בדיקה אם המשתמש לא קיים
            if (error.response?.status === 401 && 
                (error.response?.data?.includes('User does not exist') || 
                error.response?.data?.includes('משתמש לא קיים'))) {
                return rejectWithValue({ 
                    message: 'משתמש לא קיים במערכת', 
                    shouldRegister: true 
                });
            }

            if (axios.isAxiosError(error)) {
                return rejectWithValue({
                    message: error.response?.data?.message || 'שם משתמש או סיסמה שגויים',
                    shouldRegister: false
                });
            }
            return rejectWithValue({ message: 'שגיאה בהתחברות', shouldRegister: false });
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (registerData: RegisterDto, { rejectWithValue }) => {
        try {
            console.log('Attempting registration with URL:', `${process.env.REACT_APP_API_URL}/api/User`);
            console.log('Registration data:', registerData);
            
            // Create user profile with all required details
            const formData = new FormData();
            formData.append('firstName', registerData.firstName);
            formData.append('lastName', registerData.lastName);
            formData.append('email', registerData.email);
            formData.append('passwordHash', registerData.passwordHash);
            formData.append('level', registerData.level.toString());
            formData.append('goals', registerData.goals || '');
            formData.append('bio', registerData.bio || '');
            if (registerData.phoneNumber) {
                formData.append('phoneNumber', registerData.phoneNumber);
            }
            if (registerData.profilePicture) {
                formData.append('file', registerData.profilePicture);
            }

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/User`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Registration response:', response.data);

            // After successful registration, try to log in
            const loginResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/Login`, {
                email: registerData.email,
                password: registerData.passwordHash
            });

            const token = loginResponse.data.token;
            localStorage.setItem('token', token);

            // Parse user details from token
            const tokenData = parseJwt(token);
            
            const user: UserDto = {
                userId: parseInt(tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
                firstName: registerData.firstName,
                lastName: registerData.lastName,
                email: registerData.email,
                bio: registerData.bio || '',
                profilePicture: '/default-avatar.webp',
                level: registerData.level,
                goals: registerData.goals || '',
                dateJoined: new Date().toISOString(),
                status: true
            };
            
            return {
                user,
                token
            };
        } catch (error: any) {
            console.error('Registration error:', error);
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data || 'Registration failed');
            }
            return rejectWithValue('Registration failed');
        }
    }
);

// פונקציה לשחזור הסשן
export const restoreSession = createAsyncThunk(
    'auth/restoreSession',
    async (token: string, { rejectWithValue }) => {
        try {
            const decodedToken = parseJwt(token);
            if (!decodedToken) {
                localStorage.removeItem('token');
                return rejectWithValue('Invalid token');
            }

            // הגדרת הטוקן בהדר הגלובלי של axios
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const userId = parseInt(decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
            
            // יצירת אובייקט משתמש בסיסי מהטוקן
            const user: UserDto = {
                userId: userId,
                firstName: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                lastName: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || '',
                email: decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                bio: '',
                profilePicture: '/default-avatar.webp',
                level: FitnessLevel.Beginner,
                goals: '',
                dateJoined: new Date().toISOString(),
                status: true
            };

            // נסיון לשלוף את פרטי המשתמש המלאים מהשרת
            try {
                const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/User/${userId}`);
                
                if (userResponse.data) {
                    // עדכון פרטי המשתמש עם המידע המלא מהשרת
                    const userData = userResponse.data;
                    
                    // וידוא שרמת הכושר נשמרת כראוי
                    if (userData.level !== undefined && userData.level !== null) {
                        // המרה בטוחה יותר לפי המלצת TypeScript
                        const levelValue = Number(userData.level);
                        user.level = levelValue as unknown as FitnessLevel;
                    }
                    
                    // וידוא שתאריך ההצטרפות נשמר כראוי
                    if (userData.dateJoined) {
                        user.dateJoined = userData.dateJoined;
                    }
                    
                    // עדכון שאר השדות
                    Object.assign(user, {
                        ...userData,
                        // וידוא שהשדות החשובים לא נדרסים אם יש להם ערכים תקינים
                        level: user.level !== undefined ? user.level : FitnessLevel.Beginner,
                        dateJoined: user.dateJoined || new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user details:', error);
                // נמשיך עם פרטי המשתמש הבסיסיים מהטוקן
            }

            console.log('Restored user from token:', user);

            return {
                token,
                user
            };
        } catch (error) {
            console.error('Failed to restore session:', error);
            localStorage.removeItem('token');
            return rejectWithValue('Failed to restore session');
        }
    }
);

// פונקציה לעדכון פרטי המשתמש
export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (userData: any, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: AuthState };
            const { currentUser, token } = state.auth;
            
            if (!currentUser || !token) {
                return rejectWithValue('User not authenticated');
            }
            
            // שמירת העתק של המשתמש הנוכחי למקרה של כישלון
            const originalUser = { ...currentUser };
            
            // יצירת FormData לשליחת הנתונים כולל קבצים
            const formData = new FormData();
            
            // הוספת שדות בהתאם ל-DTO של השרת
            if (currentUser.userId) {
                formData.append('userId', currentUser.userId.toString());
            }
            formData.append('firstName', userData.firstName || '');
            formData.append('lastName', userData.lastName || '');
            formData.append('email', userData.email || '');
            formData.append('level', Number(userData.level).toString());
            
            // שדה PasswordHash הוא חובה לפי ה-DTO, אבל אנחנו לא רוצים לשנות את הסיסמה
            // לכן נשלח ערך פיקטיבי שהשרת יתעלם ממנו (אם השרת מאפשר זאת)
            // או שנשלח את הסיסמה המקורית אם היא קיימת
            if (userData.passwordHash) {
                formData.append('passwordHash', userData.passwordHash);
            } else {
                // שליחת ערך פיקטיבי - השרת צריך לבדוק ולהתעלם מזה אם הסיסמה לא השתנתה
                formData.append('passwordHash', 'KeepExistingPassword');
            }
            
            // שדות אופציונליים
            if (userData.bio !== undefined) {
                formData.append('bio', userData.bio);
            }
            
            if (userData.goals !== undefined) {
                formData.append('goals', userData.goals);
            }
            
            // טיפול בסטטוס
            if (userData.status !== undefined) {
                formData.append('status', userData.status.toString());
            } else if (currentUser.status !== undefined) {
                formData.append('status', currentUser.status.toString());
            } else {
                formData.append('status', 'true'); // ברירת מחדל
            }
            
            // טיפול בתאריך הצטרפות
            if (currentUser.dateJoined) {
                const dateStr = typeof currentUser.dateJoined === 'string' 
                    ? currentUser.dateJoined 
                    : new Date(currentUser.dateJoined).toISOString();
                formData.append('dateJoined', dateStr);
            } else {
                formData.append('dateJoined', new Date().toISOString());
            }
            
            // טיפול בתמונת הפרופיל
            if (userData.profilePictureFile && typeof userData.profilePictureFile === 'object' && 
                'name' in userData.profilePictureFile && 'type' in userData.profilePictureFile) {
                console.log('Sending profile picture file:', userData.profilePictureFile.name);
                formData.append('file', userData.profilePictureFile as File);
            }
            
            // הדפסת הנתונים שנשלחים לשרת לצורך דיבוג
            console.log('Updating user profile with data:', Object.fromEntries(formData.entries()));
            console.log('User ID:', currentUser.userId);
            console.log('API URL:', `${process.env.REACT_APP_API_URL}/api/User/${currentUser.userId}`);
            
            // שליחת הבקשה לעדכון פרטי המשתמש
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/User/${currentUser.userId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            console.log('Update response:', response.data);
            
            // שליפת פרטי המשתמש המעודכנים
            const updatedUserResponse = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/User/${currentUser.userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // וידוא שהנתונים החשובים נשמרים גם אם השרת לא החזיר אותם
            const updatedUser = updatedUserResponse.data;
            
            // אם השרת לא החזיר רמת כושר, נשתמש בערך המקורי
            if (updatedUser.level === undefined || updatedUser.level === null) {
                updatedUser.level = originalUser.level;
                console.log('Using original level:', originalUser.level);
            } else {
                // המרת רמת הכושר למספר ואז ל-FitnessLevel
                updatedUser.level = Number(updatedUser.level) as unknown as FitnessLevel;
                console.log('Using updated level:', updatedUser.level);
            }
            
            // אם השרת לא החזיר תאריך הצטרפות, נשתמש בערך המקורי
            if (!updatedUser.dateJoined) {
                updatedUser.dateJoined = originalUser.dateJoined;
            }
            
            return updatedUser;
        } catch (error) {
            console.error('Failed to update user profile:', error);
            if (axios.isAxiosError(error)) {
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);
                console.error('Error headers:', error.response?.headers);
                
                // הצגת פרטי השגיאה המלאים
                if (error.response?.data?.errors) {
                    console.error('Validation errors:', error.response.data.errors);
                    
                    // בדיקה אם השגיאה קשורה לסיסמה
                    if (error.response.data.errors.PasswordHash) {
                        return rejectWithValue('שגיאת סיסמה: ' + error.response.data.errors.PasswordHash[0]);
                    }
                }
                
                // בדיקה אם השגיאה קשורה להרשאות
                if (error.response?.status === 401) {
                    return rejectWithValue('אין לך הרשאה לעדכן את פרטי המשתמש. ייתכן שהסשן פג תוקף.');
                }
                
                // בדיקה אם השגיאה קשורה לפורמט הנתונים
                if (error.response?.status === 400) {
                    const errorMessage = error.response?.data?.title || error.response?.data?.message || 'הנתונים שהוזנו אינם תקינים';
                    return rejectWithValue(errorMessage);
                }
                
                return rejectWithValue(error.response?.data?.message || error.response?.data?.title || error.response?.data || 'Failed to update profile');
            }
            return rejectWithValue('Failed to update profile');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.currentUser = null;
            state.token = null;
            state.shouldRegister = false;
            localStorage.removeItem('token');
        },
        clearShouldRegister: (state) => {
            state.shouldRegister = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Restore Session
            .addCase(restoreSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(restoreSession.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(restoreSession.rejected, (state, action) => {
                state.loading = false;
                state.currentUser = null;
                state.token = null;
                state.error = action.payload as string;
            })
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.shouldRegister = false;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
                state.shouldRegister = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                const payload = action.payload as { message: string; shouldRegister: boolean };
                state.error = payload.message;
                state.shouldRegister = payload.shouldRegister;
                state.currentUser = null;
                state.token = null;
                localStorage.removeItem('token');
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload.user;
                state.error = null;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Registration failed';
            })
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                
                // וידוא שהנתונים החשובים נשמרים
                if (state.currentUser) {
                    // אם אין רמת כושר בנתונים המעודכנים, נשמור את הערך הקיים
                    if (action.payload.level === undefined || action.payload.level === null) {
                        action.payload.level = state.currentUser.level;
                        console.log('Reducer: Using current level:', state.currentUser.level);
                    } else {
                        // המרת רמת הכושר למספר ואז ל-FitnessLevel
                        action.payload.level = Number(action.payload.level) as unknown as FitnessLevel;
                        console.log('Reducer: Using payload level:', action.payload.level);
                    }
                    
                    // אם אין תאריך הצטרפות בנתונים המעודכנים, נשמור את הערך הקיים
                    if (!action.payload.dateJoined && state.currentUser.dateJoined) {
                        action.payload.dateJoined = state.currentUser.dateJoined;
                    }
                }
                
                state.currentUser = action.payload;
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to update profile';
                // לא משנים את state.currentUser במקרה של כישלון
            });
    }
});

export const { logout, clearShouldRegister } = authSlice.actions;
export default authSlice.reducer;
