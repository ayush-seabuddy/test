import { checkNetwork } from '@/src/hooks/useNetworkStatus';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ✅ Create axios instance
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Add request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const isOnline = await checkNetwork();
    if (!isOnline) {
      return Promise.reject({
        status: null,
        message: 'NO_INTERNET',
      });
    }

    // ✅ Get token from AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers['authToken'] = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    let message =
      error.response?.data?.responseMessage ||
      'Something went wrong, Please try again later';

    switch (status) {
      case 400:
      case 401:
      case 403:
      case 404:
      case 500:
        // message already set above
        break;
    }

    return Promise.reject({ status, message });
  }
);

export default apiClient;
