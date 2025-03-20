import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { LoginDto, AuthResponse } from '../../models/auth';

interface User {
    userId: number;
    firstName: string;
    email: string;
    profilePicture?: string;
}

interface AuthState {
    currentUser: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    currentUser: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null
};

// פונקציה לפענוח הטוקן
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

// פעולה להתחברות
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
                return rejectWithValue('שגיאה בפענוח פרטי המשתמש');
            }

            const user: User = {
                userId: parseInt(tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
                firstName: tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                email: tokenData['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
            };

            return {
                token,
                user
            };
        } catch (error: any) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message || 'שם משתמש או סיסמה שגויים'
                );
            }
            return rejectWithValue('שגיאה בהתחברות');
        }
    }
);

// Slice לניהול המידע של ההתחברות
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.currentUser = null;
            state.token = null;
            localStorage.removeItem('token');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'שגיאה בהתחברות';
                state.currentUser = null;
                state.token = null;
                localStorage.removeItem('token');
            });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
