// ✅ Import our custom axios client
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import apiClient from './apiClient';

// Define method types
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Define the request parameters interface
interface ApiRequestParams {
  method: Method;
  url: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

// Define success response type
interface ApiSuccessResponse<T = any> {
  success: true;
  status: number;
  data: T;
}

// Define error response type
interface ApiErrorResponse {
  success: false;
  status?: number;
  message: string;
  data: any | null;
}

// Union type for API response
type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ✅ This function will be used to make ANY API request (GET, POST, PUT, DELETE)
export const apiRequest = async <T = any>({
  method,
  url,
  params,
  data,
  headers,
}: ApiRequestParams): Promise<ApiResponse<T>> => {
  try {
    // ✅ Send API request using our apiClient
    const response: AxiosResponse<T> = await apiClient({
      method,
      url,
      params,
      data,
      headers,
    } as AxiosRequestConfig);

    // ✅ If API success, return formatted response
    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (err) {
    const error = err as AxiosError;

    console.error(error);

    return {
      success: false,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data || null,
    };
  }
};
