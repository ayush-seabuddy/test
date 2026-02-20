import Constants from "expo-constants";
import * as Device from "expo-device";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { showToast } from "@/src/components/GlobalToast";
import { TFunction } from "i18next";
import { Logger } from "@/src/utils/logger";

/**
 * Request push notification permissions and get expo push token
 */
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== "granted") {
      throw new Error(
        "Permission not granted to get push token for push notification!"
      );
    }
    
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
      
    if (!projectId) {
      throw new Error("Project ID not found");
    }
    
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      return pushTokenString;
    } catch (e: unknown) {
      throw new Error(`${e}`);
    }
  } else {
    throw new Error("Must use physical device for push notifications");
  }
}

/**
 * Request camera permissions
 */
export async function requestCameraPermission(t: TFunction): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== "granted") {
      // showToast.error(
      //   t("permissiondenied"),
      //   t("camerapermission_description")
      // );
      return false;
    }
    
    return true;
  } catch (err) {
    Logger.error("Camera permission request error:", {Error:String(err)});
    return false;
  }
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermission(t: TFunction): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      // showToast.error(
      //   t("permissiondenied"),
      //   t("medialibrarypermission_description")
      // );
      return false;
    }
    
    return true;
  } catch (err) {
    Logger.error("Media library permission request error:", {Error:String(err)});
    return false;
  }
}

/**
 * Request all app permissions
 * This should be called after localization is properly established
 */
export async function requestAllPermissions(t: TFunction): Promise<void> {
  try {
    // Request camera and media library permissions in parallel
    await Promise.all([
      requestCameraPermission(t),
      requestMediaLibraryPermission(t),
    ]);
  } catch (err) {
    Logger.error("Error requesting permissions:", {Errr:String(err)});
  }
}