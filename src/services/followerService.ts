import axios from "axios";
import {  FollowerStats } from "../models/follower";
import { UserDto } from "../models/user";
import { followUser, unfollowUser } from "./userService";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * מביא את כל העוקבים של משתמש מסוים
 */
export const getFollowers = async (userId: number): Promise<UserDto[]> => {
  const response = await axios.get<UserDto[]>(`${API_URL}/api/Follower/user/${userId}/followers`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

/**
 * מביא את כל המשתמשים שמשתמש מסוים עוקב אחריהם
 */
export const getFollowing = async (userId: number): Promise<UserDto[]> => {
  const response = await axios.get<UserDto[]>(`${API_URL}/api/Follower/following/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

/**
 * מביא סטטיסטיקות של עוקבים עבור משתמש מסוים
 */
export const getFollowerStats = async (userId: number): Promise<FollowerStats> => {
  const response = await axios.get<FollowerStats>(`${API_URL}/api/Follower/stats/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

/**
 * מביא את מספר העוקבים של משתמש מסוים
 */
export const getFollowersCount = async (userId: number): Promise<number> => {
  const response = await axios.get<UserDto[]>(`${API_URL}/api/Follower/user/${userId}/followers`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data.length;
};

export { followUser, unfollowUser };
