import Constants from 'expo-constants';
import { BaseGesture } from 'react-native-gesture-handler/lib/typescript/handlers/gestures/gesture';

// Type-safe extra config
type ExtraConfig = {
  API_URL?: string;
  env?: string;
};

// Safely access extra with fallback
const extra = Constants.expoConfig?.extra as ExtraConfig | undefined;

export const BASE_URL = extra?.API_URL;

// Define endpoints
export const ENDPOINTS = {
  LOGIN: `${BASE_URL}/user/login`,
  REGISTER: `${BASE_URL}/user/register`,
  FORGOTPASSWORD: `${BASE_URL}/user/resendOtp`,
  VERIFYOTP: `${BASE_URL}/user/verifyOtp`,
  RESETPASSWORD: `${BASE_URL}/user/resetPassword`,
  UPLOADFILE: `${BASE_URL}/user/uploadFile`,
  GETALLCOUNTRIES:`${BASE_URL}/user/getAllCountries`,
  UPDATEPROFILE:`${BASE_URL}/user/updateProfile`,
  GetAllSocialPost: `${BASE_URL}/user/getAllHangoutPost`,
  VIEW_PROFILE: `${BASE_URL}/user/viewUserProfile`,
};