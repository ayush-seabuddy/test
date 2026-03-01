import React, { createContext, useContext, useEffect, useRef, useState, useTransition } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { showToast } from "@/src/components/GlobalToast";
import { useTranslation } from "react-i18next";

type NotificationContextType = {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
};

const NotificationContext = createContext<NotificationContextType>({
  expoPushToken: null,
  notification: null,
  error: null,
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const toastShownRef = useRef(false);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      try {
        if (!Device.isDevice) {
          setError("Must use physical device");
          return;
        }

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } =
            await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          setError("Notification permission not granted");

          if (!toastShownRef.current) {
            toastShownRef.current = true;
            // showToast.error(
            //   t("enable_notifications"),
            //   t("enable_notifications_description")
            // );
          }

          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        setExpoPushToken(tokenData.data);

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
          });
        }
      } catch (e: any) {
        setError(e.message);
      }
    };

    registerForPushNotifications();

    const subscription =
      Notifications.addNotificationReceivedListener(setNotification);

    return () => subscription.remove();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
