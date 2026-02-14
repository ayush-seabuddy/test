import { checkNetwork } from "@/src/hooks/useNetworkStatus";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const apiClient = axios.create({
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const isOnline = await checkNetwork();
    if (!isOnline) {
      return Promise.reject({
        status: null,
        message: "No Internet Connection",
      });
    }

    // Add token if present
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers["authToken"] = token;
    }

    // Set correct Content-Type
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    } else if (config.method !== "get") {
      config.headers["Content-Type"] = "application/json";
    }

    // ⬇️ NEW LOG — Logs all request headers
    console.log("📤 REQUEST HEADERS:", config.headers);

    console.log("📤 REQUEST URL:", config.url);

    if (config.method?.toLowerCase() !== "get") {
      console.log("📤 REQUEST DATA:", config.data);
    }

    console.log("📤 REQUEST PARAMS:", config.params);

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    console.log("📥 RESPONSE URL:", response.config.url);
    console.log("📥 RESPONSE STATUS:", response.status);
    console.log("📥 RESPONSE DATA:", JSON.stringify(response.data));

    return response;
  },
  (error) => {
    console.log("❌ ERROR URL:", error.config?.url);
    console.log("❌ ERROR RESPONSE:", error.response?.data);
    console.log("❌ ERROR MESSAGE:", error.message);

    return Promise.reject(error);
  }
);

export default apiClient;
