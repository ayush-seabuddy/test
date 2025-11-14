import { checkNetwork } from "@/src/hooks/useNetworkStatus";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

// ✅ Create axios instance
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const isOnline = await checkNetwork();
    if (!isOnline) {
      return Promise.reject({
        status: null,
        message: t("nointernetconnection"),
      });
    }

    // ✅ Add token if exists
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers["authToken"] = token;
    }

    // 🟡 Log raw request URL + data
    console.log("📤 REQUEST URL:", config.url);
    console.log("📤 REQUEST DATA:", config.data);

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // 🟢 Log full raw response
    console.log("📥 RESPONSE URL:", response.config.url);
    console.log("📥 RESPONSE STATUS:", response.status);
    console.log("📥 RESPONSE DATA:", response.data);

    return response;
  },
  (error) => {
    // 🔴 Log full raw error response
    console.log("❌ ERROR URL:", error.config?.url);
    console.log("❌ ERROR RESPONSE:", error.response?.data);
    console.log("❌ ERROR MESSAGE:", error.message);

    return Promise.reject(error);
  }
);

export default apiClient;
