// App.js
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashLogo from "../../splashscreens/SplashLogo";
import LoginData from "./LoginData";
import RegisterData from "./RegisterData";
import AccountverificationData from "./AccountverificationData";
import ForgotpasswordData from "./ForgotpasswordData";
import PasswordResetData from "./PasswordResetData";
import SetNewPasswordData from "./SetNewPasswordData";
import Register from "../Register";
import { PERMISSIONS, requestNotifications, request, RESULTS } from "react-native-permissions";
import { Alert, PermissionsAndroid } from "react-native";
import messaging from "@react-native-firebase/messaging"; // For Firebase push notifications

const Stack = createStackNavigator();

const AuthNav = ({ route }) => {
  const { email, fullName, countryCode, mobileNumber } = route.params || {};

  const requestPermissions = async () => {
    try {
      // === Request Camera Permission ===
      const cameraPermission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      const cameraStatus = await request(cameraPermission);

      // === Request Notification Permission ===
      let notificationStatus = RESULTS.DENIED;

      if (Platform.OS === 'ios') {
        const { status } = await requestNotifications(['alert', 'sound', 'badge']);
        notificationStatus = status;
      } else {
        const androidStatus = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        notificationStatus =
          androidStatus === PermissionsAndroid.RESULTS.GRANTED
            ? RESULTS.GRANTED
            : RESULTS.DENIED;
      }

      handlePermissions(cameraStatus, notificationStatus);
    } catch (error) {
      console.error('Permission Request Error:', error);
      Alert.alert(
        'Unexpected Error',
        'Something went wrong while requesting permissions. Please try again.'
      );
    }
  };

  const handlePermissions = (cameraStatus, notificationStatus) => {
    const isCameraGranted = cameraStatus === RESULTS.GRANTED;
    const isNotificationGranted = notificationStatus === RESULTS.GRANTED;

    if (isCameraGranted && isNotificationGranted) {
    } else {
      let deniedPermissions = [];

      if (!isCameraGranted) deniedPermissions.push('Camera');
      if (!isNotificationGranted) deniedPermissions.push('Notifications');

      Alert.alert(
        'Permissions Required',
        `The app needs ${deniedPermissions.join(
          ' and '
        )} permission${deniedPermissions.length > 1 ? 's' : ''} to function properly.`,
        [
          {
            text: 'OK',
            style: 'default',
          },
        ]
      );
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="LoginData"
        component={LoginData}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RegisterData"
        component={RegisterData}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AccountverificationData"
        component={AccountverificationData}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotpasswordData"
        component={ForgotpasswordData}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PasswordResetData"
        component={PasswordResetData}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SetNewPasswordData"
        component={SetNewPasswordData}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Register"
        component={Register}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthNav;
