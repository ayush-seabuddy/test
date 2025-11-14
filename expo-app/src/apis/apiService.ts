import { apiRequest } from "./apiHelpers";
import { ENDPOINTS } from "./endpoints";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
}

export interface SocialPostParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}

// Login API
export const login = async (
  payload: LoginRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.LOGIN,
    data: payload,
  });
};

// Register API
export const register = async (
  payload: RegisterRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.REGISTER,
    data: payload,
  });
};

// Forgot Password
export const forgotpassword = async (
  payload: ForgotPasswordRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.FORGOTPASSWORD,
    data: payload,
  });
};

// Verify OTP
export const verifyotp = async (
  payload: VerifyOtpRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.VERIFYOTP,
    data: payload,
  });
};

// Reset Password
export const resetpassword = async (
  payload: ResetPasswordRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.RESETPASSWORD,
    data: payload,
  });
};

// Get all social posts
export const getAllSocialPost = async (
  params?: SocialPostParams
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GetAllSocialPost,
    params,
  });
};
