import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL ;

/**
 * מבנה הנתונים של תגובת ההתחברות מהשרת
 */
export interface AuthResponse {
  token: string;
}

/**
 * מבצע קריאת API להתחברות ומחזיר את ה-Token
 */
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(
    `${API_URL}/api/Login?email=${email}&password=${password}`
  );

  // שמירת ה-Token בלוקאל סטורג'
  localStorage.setItem("token", response.data.token);
  return response.data;
};

/**
 * מחזיר את ה-Token השמור בלוקאל סטורג'
 */
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

/**
 * מתנתק על ידי מחיקת ה-Token מהלוקאל סטורג'
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
};
