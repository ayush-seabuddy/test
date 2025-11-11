import { apiRequest } from "./apiHelpers";
import { ENDPOINTS } from "./endpoints";



interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const login = async (
  email: string,
  password: string
): Promise<any> => {
  return await apiRequest({
    method: 'POST',
    url: ENDPOINTS.LOGIN,
    data: { email, password },
  });
};


export const register = async (
  userData: RegisterRequest
) => {
  return await apiRequest({
    method: 'POST',
    url: ENDPOINTS.REGISTER,
    data: userData,
  });
};
