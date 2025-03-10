import axios from "axios";
import {  FollowerStats } from "../models/follower";
import { UserDto } from "../models/user";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * מביא את כל העוקבים של משתמש מסוים
 */
export const getFollowers = async (userId: number): Promise<UserDto[]> => {
  const response = await axios.get<UserDto[]>(`${API_URL}/api/Follower/followers/${userId}`, {
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
 * הוספת עוקב חדש
 */
export const followUser = async (followedUserId: number): Promise<string> => {
  const response = await axios.post(
    `${API_URL}/api/Follower/follow/${followedUserId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
};

/**
 * הסרת עוקב
 */
export const unfollowUser = async (followedUserId: number): Promise<string> => {
  const response = await axios.delete(`${API_URL}/api/Follower/unfollow/${followedUserId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};
