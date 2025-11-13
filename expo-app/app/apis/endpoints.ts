import Constants from 'expo-constants';

// Type-safe extra config
type ExtraConfig = {
  API_URL?: string;
  env?: string;
};

// Safely access extra with fallback
const extra = Constants.expoConfig?.extra as ExtraConfig | undefined;

const API_URL = extra?.API_URL ;

export const BASE_URL = API_URL;

// Define endpoints
export const ENDPOINTS = {
  LOGIN: `${BASE_URL}/user/login`,
  REGISTER: `${BASE_URL}/user/register`,
  GetAllSocialPost: `${BASE_URL}/user/getAllHangoutPost`,
};