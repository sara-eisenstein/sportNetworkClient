import axios from "axios";
import { UserDto } from "../models/user";

const API_URL = process.env.REACT_APP_API_URL ;

/**
 * מביא את כל המשתמשים
 */
export const getUsers = async (): Promise<UserDto[]> => {
  const response = await axios.get<UserDto[]>(`${API_URL}`);
  return response.data;
};

/**
 * מביא משתמש לפי ID
 */
export const getUserById = async (id: number): Promise<UserDto> => {
  const response = await axios.get<UserDto>(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

/**
 * הוספת משתמש חדש
 */
export const createUser = async (userData: FormData): Promise<string> => {
  const response = await axios.post(`${API_URL}`, userData);
  return response.data;
};

/**
 * עדכון משתמש קיים
 */
export const updateUser = async (id: number, userData: FormData): Promise<string> => {
  const response = await axios.put(`${API_URL}/${id}`, userData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

/**
 * מביא תמונת פרופיל של משתמש
 */
export const getUserImage = async (id: number): Promise<string> => {
  return `${process.env.REACT_APP_API_URL}/getUserImage/${id}`;
};
