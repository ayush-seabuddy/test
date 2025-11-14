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


interface ApiSuccessResponse<T = any> {
  success: true;
  status: number;
  data: T;
}


interface ApiErrorResponse {
  success: false;
  status?: number;
  message: string;
  data: any | null;
}


type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export const apiRequest = async <T = any>({
  method = 'GET',
  url,
  params,
  data,
  headers,
}: ApiRequestParams): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<T> = await apiClient({
      method,
      url,
      params,
      data,
      headers,
    } as AxiosRequestConfig);
    

    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (err) {
    const error = err as AxiosError;

    // console.error(error);

    return {
      success: false,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data || null,
    };
  }
};
