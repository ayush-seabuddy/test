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


export const getAllSocialPost = async (params) => {
  return await apiRequest({
    method: "GET",
    url: ENDPOINTS.GetAllSocialPost,
    params
  });
};
