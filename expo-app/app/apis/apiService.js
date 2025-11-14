import { apiRequest } from "./apiHelpers";
import { ENDPOINTS } from "./endpoints";

export const login = async (email, password) => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.LOGIN,
    data: { email, password },
  });
};

export const register = async (userData) => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.REGISTER,
    data: userData,
  });
};

export const forgotpassword = async (email) => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.FORGOTPASSWORD,
    data: { email },
  });
};

export const verifyotp = async (email, otp) => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.VERIFYOTP,
    data: { email, otp },
  });
};

export const resetpassword = async (email, password) => {
  return await apiRequest({
    method: "POST",
    url: ENDPOINTS.RESETPASSWORD,
    data: { email, password }
  })
}


export const getAllSocialPost = async (params) => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GetAllSocialPost,
    params
  });
};


export const viewProfile = async (params) => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.VIEW_PROFILE,
    params
  });
};
