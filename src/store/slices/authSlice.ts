import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { LoginDto, RegisterDto, AuthResponse } from '../../models/auth';

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
    shouldRegister: boolean;
}

const initialState: AuthState = {
    currentUser: null,
    token: localStorage.getItem('token'),
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
            console.log('Attempting registration with URL:', `${process.env.REACT_APP_API_URL}/api/auth/register`);
            console.log('Registration data:', registerData);
            
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/auth/register`,
                registerData
            );

            console.log('Registration response:', response.data);
            
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                return response.data;
            } else {
                return rejectWithValue('No token received from server');
            }
        } catch (error: any) {
            console.error('Registration error details:', error.response?.data || error.message);
            console.error('Full error object:', error);
            
            if (error.response) {
                // Server responded with an error
                return rejectWithValue(error.response.data?.message || 'Registration failed');
            } else if (error.request) {
                // Request was made but no response received
                return rejectWithValue('No response from server. Please check your connection.');
            } else {
                // Error in request setup
                return rejectWithValue('Error setting up the request');
            }
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
            });
    }
});

export const { logout, clearShouldRegister } = authSlice.actions;
export default authSlice.reducer;
