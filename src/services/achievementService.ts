import axios from "axios";
import { Achievement } from "../models/Achievement";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * הוספת הישג חדש
 */
export const addAchievement = async (achievement: Achievement): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('AchievementId', '');
    formData.append('UserId', achievement.userId.toString());
    formData.append('Title', achievement.title);
    formData.append('Description', achievement.description);
    
    // Format date as dd/MM/yyyy
    const date = new Date();
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    formData.append('DateEarned', formattedDate);

    const response = await axios.post(`${API_URL}/api/Achievement`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding achievement:", error);
    throw error;
  }
};

/**
 * עדכון הישג קיים
 */
export const updateAchievement = async (id: number, achievement: Achievement): Promise<string> => {
  try {
    const response = await axios.put(`${API_URL}/api/Achievement/${id}`, achievement);
    return response.data;
  } catch (error) {
    console.error("Error updating achievement:", error);
    throw error;
  }
};

/**
 * מחיקת הישג לפי ID
 */
export const deleteAchievement = async (id: number): Promise<string> => {
  try {
    const response = await axios.delete(`${API_URL}/api/Achievement/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting achievement:", error);
    throw error;
  }
};

/**
 * קבלת כל ההישגים של משתמש לפי userId
 */
export const getAchievementsByUserId = async (userId: number): Promise<Achievement[]> => {
  try {
    const response = await axios.get<Achievement[]>(`${API_URL}/api/Achievement/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching achievements:", error);
    throw error;
  }
};
