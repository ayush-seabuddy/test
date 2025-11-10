import axios from "axios";
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
 const api = axios.create();

api.interceptors.response.use(
  (response) => {
    if(response.data.responseCode === 405){
      if (navigationRef.isReady()) {
        navigationRef.navigate("AuthNav");
      }
    }
    return response},
  async (error) => {
    if (error.response?.status === 403) {
      if (navigationRef.isReady()) {
        navigationRef.navigate("AuthNav");
      }
    }

    return Promise.reject(error);
  }
);

export default api