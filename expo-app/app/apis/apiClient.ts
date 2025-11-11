import { checkNetwork } from '@/src/hooks/useNetworkStatus';
import axios from 'axios';


// ✅ Create an axios instance (our custom API caller)
const apiClient = axios.create({
  timeout: 10000,             // If API takes more than 10 seconds → stop it
  headers: {
    'Content-Type': 'application/json',   // We send data in JSON format
  },
});



apiClient.interceptors.request.use(
  async (config) => {
    const isOnline = await checkNetwork();
    if (!isOnline) {
      return Promise.reject({
        status: null,
        message: "NO_INTERNET",
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);



apiClient.interceptors.response.use(
  response => response, // ✅ If response success → return it
  (error) => {
    // ✅ Get status code from API error (like 400, 401 etc.)
    const status = error.response?.status;

    // ✅ Default error message if server does not give one
    let message = error.response?.data?.responseMessage || "Something went wrong, Please try again later";

    // ✅ Change error message based on status code
    switch (status) {
      case 400: message = message; break;     // Wrong data sent
      case 401: message = message; break;   // Login required / token issue
      case 403: message = message; break;      // No permission
      case 404: message = message; break;      // API not found
      case 500: message = message; break;   // Server problem
    }

    // ❌ Return final error to app
    return Promise.reject({
      status,
      message,
    });
  }
);


// ✅ Export our axios client so we can use it anywhere
export default apiClient;
