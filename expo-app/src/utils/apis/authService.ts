import { apiRequest } from "./apiHelpers";
import { ENDPOINTS } from "./endpoints";

// Define request/response types
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    // add other user fields here
  };
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  // add other registration fields here
}

interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    // add other user fields here
  };
}

// ✅ Login function
export const login = async (
  email: string,
  password: string
) => {
  return await apiRequest<LoginResponse>({
    method: 'POST',
    url: ENDPOINTS.LOGIN,
    data: { email, password } as LoginRequest,
  });
};

// ✅ Register function
export const register = async (
  userData: RegisterRequest
) => {
  return await apiRequest<RegisterResponse>({
    method: 'POST',
    url: ENDPOINTS.REGISTER,
    data: userData,
  });
};
