import AsyncStorage from "@react-native-async-storage/async-storage";
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

export interface UploadFileRequest {
  file: string;
}

export interface SocialPostParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  status?: number;
  message?: string;
  data: T;
}


export const login = async (
  payload: LoginRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.LOGIN,
    data: payload,
  });
};

export const register = async (
  payload: RegisterRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.REGISTER,
    data: payload,
  });
};

export const forgotpassword = async (
  payload: ForgotPasswordRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.FORGOTPASSWORD,
    data: payload,
  });
};

export const verifyotp = async (
  payload: VerifyOtpRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.VERIFYOTP,
    data: payload,
  });
};

export const resetpassword = async (
  payload: ResetPasswordRequest
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.RESETPASSWORD,
    data: payload,
  });
};

export const uploadfile = async (payload: UploadFileRequest) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('file', {
      uri: payload.file,
      name: 'image.jpg',
      type: 'image/jpeg',
    } as any);
    const response = await apiRequest({
      method: 'POST',
      url: ENDPOINTS.UPLOADFILE,
      data: formData,
    });
    return response;
  } catch (error) {
    console.log('UPLOAD ERROR:', error);
    throw error;
  }
};

export const getallcountries = async (): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GETALLCOUNTRIES,
  });
};

export const getAllSocialPost = async (
  params?: SocialPostParams
): Promise<ApiResponse> => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GetAllSocialPost,
    params,
  });
};
