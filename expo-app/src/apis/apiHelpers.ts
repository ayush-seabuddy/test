import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import apiClient from "./apiClient";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

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
  message: string;
}

interface ApiErrorResponse {
  success: false;
  status?: number;
  message: string;
  data: any | null;
}

type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export const apiRequest = async <T = any>({
  method,
  url,
  params,
  data,
  headers,
}: ApiRequestParams): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<any> = await apiClient({
      method,
      url,
      params,
      data,
      headers,
    } as AxiosRequestConfig);

    // 🔍 Extract keys according to your backend format
    const { responseCode, responseMessage, result } = response.data || {};

    // Treat backend responseCode as status indicator
    const isSuccess = responseCode === 200;

    if (isSuccess) {
      return {
        success: true,
        status: responseCode || response.status,
        data: result || response.data,
        message: responseMessage || "Request successful",
      };
    } else {
      return {
        success: false,
        status: responseCode || response.status,
        message: responseMessage || "Request failed",
        data: result || null,
      };
    }
  } catch (err) {
    const error = err as AxiosError;
    const status = error.response?.status ?? 0;
    const errorData = error.response?.data ?? null;

    // handle message safely from backend or axios error
    const message =
      (errorData as any)?.responseMessage ||
      (errorData as any)?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    return {
      success: false,
      status,
      message,
      data: errorData,
    };
  }
};