import React, { useEffect, useState } from "react";
import {
  createNavigationContainerRef,
  NavigationContainer,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Alert, Platform, View, StatusBar, LogBox, Linking, Modal, TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { request, RESULTS, PERMISSIONS } from "react-native-permissions";
import { jwtDecode } from "jwt-decode";
import queryString from "query-string";
import { Provider } from "react-redux";
import store from "./src/Redux/store";
import SplashLogo from "./src/splashscreens/SplashLogo";
import FlashMessage from "react-native-flash-message";
import AuthNav from "./src/auth/AuthFormData/AuthNav";
import AppNav from "./src/auth/AuthFormData/AppNav";
import { Provider as PaperProvider } from "react-native-paper";
import { getFcmToken } from "./src/PushNotification/NotificationListner";
import RegisterData from "./src/auth/AuthFormData/RegisterData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import notifee, { EventType } from "@notifee/react-native";
import socketService from "./src/Socket/Socket";
import { onDisplayNotification } from "./src/PushNotification/DisplayNotification";
import LogoutModal from "./src/component/Modals/LogoutModal";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { navigationRef } from "./src/CustomAxios";
import Orientation from "react-native-orientation-locker";
import VersionCheck from "react-native-version-check";
import * as Clarity from "@microsoft/react-native-clarity";
import Colors from "./src/colors/Colors";
import CustomSurvey from "./src/CustomSurvey";

const { width } = Dimensions.get("window");

const Stack = createStackNavigator();

const NAVIGATION_IDS = [
  "GROUP_ACTIVITY",
  "HOME",
  "ANNOUNCEMENT",
  "CONTENT",
  "HANGOUT",
  "CHAT",
  "HAPPINESS",
  "POMS",
];

LogBox.ignoreAllLogs();

function buildDeepLinkFromNotificationData(data) {
  console.log("data: ", data);
  const navigationId = data?.navigationId;
  console.log("navigationId: ", navigationId);
  if (!NAVIGATION_IDS.includes(navigationId)) {
    console.warn("Unverified navigationId:", navigationId);
    return null;
  }

  if (navigationId === "GROUP_ACTIVITY") {
    const item = data?.item;
    return item
      ? `seabuddyapp://app/WorkoutBuddies/${encodeURIComponent(JSON.stringify(item))}`
      : `seabuddyapp://app/WorkoutBuddies`;
  }
  if (navigationId === "HOME") {
    return `seabuddyapp://app/home`;
  }
  if (navigationId === "HANGOUT") {
    const item = data?.item;
    return item?.id
      ? `seabuddyapp://app/SinglePost/${encodeURIComponent(item.id)}`
      : null; // Return null if no postId is available
  }
  if (navigationId === "CHAT") {
    socketService.initilizeSocket();
    const item = data?.item;
    return item
      ? `seabuddyapp://app/ChatRoom/${encodeURIComponent(JSON.stringify(item))}`
      : `seabuddyapp://app/ChatRoom`;
  }
  if (navigationId === "HAPPINESS") {
    return `seabuddyapp://app/HappinessIndex`;
  }
  if (navigationId === "POMS") {
    return `seabuddyapp://app/POMSTest`;
  }
  if (navigationId === "ANNOUNCEMENT") {
    const item = data?.item;
    return item
      ? `seabuddyapp://app/AnouncementDetails/${encodeURIComponent(
          JSON.stringify(item)
        )}`
      : `seabuddyapp://app/AnouncementDetails`;
  }
  if (navigationId === "CONTENT") {
    const contentType = data?.contentType;
    const item = data?.item;
    if (!contentType) {
      console.warn("Missing contentType for CONTENT navigationId:", data);
      return null;
    }

    let url;
    switch (contentType) {
      case "MUSIC":
        url = item
          ? `seabuddyapp://app/MusicPlayer/${encodeURIComponent(
              JSON.stringify(item)
            )}`
          : `seabuddyapp://app/MusicPlayer`;
        break;
      case "ANNOUNCEMENT":
        url = item
          ? `seabuddyapp://app/AnouncementDetails/${encodeURIComponent(
              JSON.stringify(item)
            )}`
          : `seabuddyapp://app/AnouncementDetails`;
        break;
      case "VIDEO":
        url = item
          ? `seabuddyapp://app/VideosDetails/${encodeURIComponent(
              JSON.stringify(item)
            )}`
          : `seabuddyapp://app/VideosDetails`;
        break;
      case "ARTICLE":
        url = item
          ? `seabuddyapp://app/ArticlesDetails/${encodeURIComponent(
              JSON.stringify(item)
            )}`
          : `seabuddyapp://app/ArticlesDetails`;
        break;
      default:
        console.warn(
          "Unhandled contentType for CONTENT navigationId:",
          contentType
        );
        return null;
    }
    return url;
  }

  console.warn("Unhandled navigationId:", navigationId);
  return null;
}

function safeJsonParse(value) {
  if (typeof value !== "string") return value;

  const trimmedValue = value.trim();
  if (
    (trimmedValue.startsWith("{") && trimmedValue.endsWith("}")) ||
    (trimmedValue.startsWith("[") && trimmedValue.endsWith("]")) ||
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"'))
  ) {
    try {
      return JSON.parse(trimmedValue);
    } catch (e) {
      return value;
    }
  }
  return value;
}

function parseDeepLinkUrl(url) {
  if (!url || !url.startsWith("seabuddyapp://")) return null;

  const [, path] = url.split("seabuddyapp://app/");
  if (!path) return null;

  const [screen, param] = path.split("/");
  const decodedParam = param ? safeJsonParse(decodeURIComponent(param)) : null;

  return {
    screen,
    params: screen === "SinglePost" ? { postId: decodedParam } : decodedParam ? { item: decodedParam } : undefined,
  };
}

const linking = {
  prefixes: ["seabuddyapp://"],
  config: {
    screens: {
      SplashLogo: "splash",
      AuthNav: "auth",
      RegisterData: "register",
      AppNav: {
        path: "app",
        screens: {
          WorkoutBuddies: "WorkoutBuddies/:activity",
          ChatRoom: "ChatRoom/:data",
          AnouncementDetails: "AnouncementDetails/:item",
          MusicPlayer: "MusicPlayer/:dataItem",
          VideosDetails: "VideosDetails/:dataItem",
          ArticlesDetails: "ArticlesDetails/:dataItem",
          Home: "home",
          Mbti: "mbti/:item?",
          Mbti_Start_Test: "mbti-start",
          HappinessIndex: "HappinessIndex",
          POMSTest: "POMSTest",
          SinglePost: "SinglePost/:postId"
        },
      },
    },
  },
  async getInitialURL() {
    try {
      // Check for initial URL (e.g., deep link)
      const url = await Linking.getInitialURL();
      if (url) {
        console.log("📲 Initial URL:", url);
        return url;
      }

      // Check for initial notification (app opened from killed state)
      const message = await messaging().getInitialNotification();
      if (message?.data) {
        const parsedData = Object.fromEntries(
          Object.entries(message.data).map(([key, value]) => [
            key,
            safeJsonParse(value),
          ])
        );

        console.log("📩 Initial Notification Data:", JSON.stringify(parsedData, null, 2));

        // Handle UPDATE type notification
        if (parsedData.type === "UPDATE") {
          const url = Platform.OS === "ios" ? parsedData.iosUrl : parsedData.androidUrl;
          if (url) {
            console.log(`📲 Opening store URL from initial notification: ${url}`);
            try {
              await Linking.openURL(url);
              console.log("📲 Successfully opened store URL");
              return null; // Prevent further navigation
            } catch (err) {
              console.error("📲 Error opening store URL:", err);
              return null; // Prevent further navigation
            }
          } else {
            console.warn("📲 No valid URL provided for UPDATE notification");
            return null; // Prevent further navigation
          }
        }

        // Handle other notification types
        const data = {
          navigationId: parsedData.page || "Home",
          item: parsedData.id ? { id: parsedData.id } : parsedData.item || null,
          contentType: parsedData.contentType,
        };

        const deeplinkURL = buildDeepLinkFromNotificationData(data);
        console.log("📲 Generated deeplink URL:", deeplinkURL);
        return deeplinkURL;
      }
      return null;
    } catch (error) {
      console.error("📲 Error in getInitialURL:", error);
      return null;
    }
  },
  subscribe(listener) {
    const onReceiveURL = ({ url }) => {
      console.log("📲 Received URL:", url);
      listener(url);
    };
    const linkingSubscription = Linking.addEventListener("url", onReceiveURL);

    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.data) {
        const parsedData = Object.fromEntries(
          Object.entries(remoteMessage.data).map(([key, value]) => [
            key,
            safeJsonParse(value),
          ])
        );

        console.log("📩 Notification Opened (Background):", JSON.stringify(parsedData, null, 2));

        // Handle UPDATE type notification
        if (parsedData.type === "UPDATE") {
          const url = Platform.OS === "ios" ? parsedData.iosUrl : parsedData.androidUrl;
          if (url) {
            console.log(`📲 Opening store URL from notification: ${url}`);
            Linking.openURL(url)
              .then(() => console.log("📲 Successfully opened store URL"))
              .catch(err => console.error("📲 Error opening store URL:", err));
            return; // Prevent further navigation
          } else {
            console.warn("📲 No valid URL provided for UPDATE notification");
            return; // Prevent further navigation
          }
        }

        // Handle other notification types
        const data = {
          navigationId: parsedData.page || "Home",
          item: parsedData.id ? { id: parsedData.id } : parsedData.item || null,
          contentType: parsedData.contentType,
        };

        const deeplinkURL = buildDeepLinkFromNotificationData(data);
        if (deeplinkURL) {
          console.log("📲 Generated deeplink URL:", deeplinkURL);
          listener(deeplinkURL);
        }
      }
    });

    return () => {
      linkingSubscription.remove();
      unsubscribe();
    };
  },
};

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification } = detail;

  if (type === EventType.PRESS && notification?.data) {
    // Log notification data when clicked in background
    console.log("📩 Notification Clicked (Background):", JSON.stringify(notification, null, 2));

    const parsedData = Object.fromEntries(
      Object.entries(notification.data).map(([key, value]) => [
        key,
        safeJsonParse(value),
      ])
    );

    // Handle UPDATE type notification
    if (parsedData.type === "UPDATE") {
      const url = Platform.OS === "ios" ? parsedData.iosUrl : parsedData.androidUrl;
      if (url) {
        console.log(`📲 Opening store URL: ${url}`);
        try {
          await Linking.openURL(url);
          console.log("📲 Successfully opened store URL");
        } catch (err) {
          console.error("📲 Error opening store URL:", err);
        }
        return; // Exit early to prevent further navigation
      } else {
        console.warn("📲 No valid URL provided for UPDATE notification");
        return; // Exit early if no URL is available
      }
    }

    // Handle other notification types
    const data = {
      navigationId: parsedData.page || "Home",
      item: parsedData.id ? { id: parsedData.id } : parsedData.item || null,
      contentType: parsedData.contentType,
    };

    const deeplinkURL = buildDeepLinkFromNotificationData(data);

    if (deeplinkURL) {
      const navigationParams = parseDeepLinkUrl(deeplinkURL);
      if (navigationParams) {
        navigateToScreen(navigationParams.screen, navigationParams.params);
      }
    }
  }
});

let pendingNavigation = null;

function navigateToScreen(screen, params) {
  console.log("params: ", params);
  console.log("screen: ", screen);
  if (navigationRef.current) {
    navigationRef.current.navigate("AppNav", {
      screen,
      params,
    });
    pendingNavigation = null; // Clear pending navigation
  } else {
    // Store the navigation params to process later
    pendingNavigation = { screen, params };
    setTimeout(() => navigateToScreen(screen, params), 100); // Retry
  }
}

const VersionCheckModal = ({ visible, onUpdate, onClose, versionInfo }) => {
  if (!versionInfo) return null;

  const title = versionInfo.isRequired ? "Update Required" : "Update Available";
  const showLater = !versionInfo.isRequired;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <StatusBar backgroundColor={"rgba(0, 0, 0, 0.7)"} />
        <View style={styles.modalContainer}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.descriptionText}>
            {versionInfo.responseMessage}
          </Text>
          <View style={[styles.buttonContainer, { justifyContent: showLater ? "space-between" : "center" }]}>
            {showLater && (
              <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={onClose}
              >
                <Text style={styles.noButtonText}>Later</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.yesButton]}
              onPress={onUpdate}
            >
              <Text style={styles.yesButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  titleText: {
    fontSize: 16,
    color: "#333333",
    fontFamily: "Poppins-SemiBold",
  },
  descriptionText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    lineHeight: 24,
    color: "#666666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 5,
  },
  noButton: {
    backgroundColor: "#f0f0f0",
  },
  noButtonText: {
    color: "#333333",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
  },
  yesButton: {
    backgroundColor: Colors.secondary,
  },
  yesButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 24,
  },
});

const App = () => {
  const [linkData, setLinkData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isVersionModalVisible, setIsVersionModalVisible] = useState(false);
  const [versionInfo, setVersionInfo] = useState(null);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      if (linkData) {
        navigationRef.current?.reset({
          index: 0,
          routes: [{ name: "RegisterData", params: linkData }],
        });
      }
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    } finally {
      setIsModalVisible(false);
    }
  };

  useEffect(() => {
    Orientation.lockToPortrait();
    getFcmToken();
    checkAppVersion();

    if (!__DEV__) {
      // Run only in Release mode
      Clarity.initialize("t9oq6u2hhw", {
        logLevel: Clarity.LogLevel.Verbose, // remove or adjust if needed
      });

      Clarity.setOnSessionStartedCallback((sessionId) => {
        console.log("Clarity session started:", sessionId);
      });
    }
  }, []);

  const compareVersions = (current, latest) => {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;
      if (currentPart < latestPart) return true; // Update needed
      if (currentPart > latestPart) return false;
    }
    return false;
  };

  const checkAppVersion = async () => {
    try {
      const currentVersion = await VersionCheck.getCurrentVersion();
      console.log("📱 Current Version:", currentVersion);

      const response = await fetch('https://seabuddyapi.seekware.in/api/v1/user/getLastVersion', {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });
      const data = await response.json();
      if (data.responseCode === 200) {
        const platformKey = Platform.OS === 'ios' ? 'ios' : 'android';
        const platformVersionInfo = data.result[platformKey];
        const latestVersion = platformVersionInfo.lastVersion;

        console.log("🌐 Latest Version:", latestVersion);

        if (platformVersionInfo.isPopUp && compareVersions(currentVersion, latestVersion)) {
          // Fallback to store URL if API URL is missing
          const updateUrl = platformVersionInfo.url || (await VersionCheck.getStoreUrl());
          setVersionInfo({ ...platformVersionInfo, url: updateUrl });
          setIsVersionModalVisible(true);
        }
      }
    } catch (error) {
      console.error("❌ Error checking app version:", error);
    }
  };

  const handleUpdate = () => {
    if (versionInfo?.url) {
      Linking.openURL(versionInfo.url).catch(err => console.error('Error opening URL:', err));
    }
    setIsVersionModalVisible(false);
  };

  const requestPermissions = async () => {
    const cameraStatus = await request(
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA
    );

    if (cameraStatus !== RESULTS.GRANTED) {
      Alert.alert(
        "Permissions Denied",
        "Camera permissions are required for full functionality."
      );
    }
  };

  const handleDeepLink = async (event) => {
    const { url } = event;
    if (!url) return;

    const queryParams = queryString.parse(url.split("?")[1]);
    const token = queryParams?.token;

    if (token && typeof token === "string") {
      try {
        const decodedToken = jwtDecode(token);
        const { email, fullName, countryCode, mobileNumber } = decodedToken;

        setLinkData({ email, fullName, countryCode, mobileNumber });

        const storedDetails = await AsyncStorage.getItem("userDetails");
        const userDetails = JSON.parse(storedDetails);

        if (userDetails?.authToken) {
          setUserDetails(userDetails);
          setIsModalVisible(true);
        } else {
          navigationRef.current?.reset({
            index: 0,
            routes: [
              {
                name: "RegisterData",
                params: { email, fullName, countryCode, mobileNumber },
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error decoding JWT token:", error);
      }
    }

    const navigationParams = parseDeepLinkUrl(url);
    if (navigationParams) {
      navigateToScreen(navigationParams.screen, navigationParams.params);
    }
  };

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const linkingListener = Linking.addEventListener("url", handleDeepLink);
    return () => linkingListener.remove();
  }, []);

  useEffect(() => {
    const unsubscribeFcm = messaging().onMessage(async (remoteMessage) => {
      // Log the entire remoteMessage object
      console.log("📩 Notification Received:", JSON.stringify(remoteMessage, null, 2));

      if (remoteMessage?.notification && remoteMessage?.data) {
        await onDisplayNotification(
          remoteMessage.notification.title,
          remoteMessage.notification.body,
          remoteMessage.data
        );
      }
    });

    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data) {
        // Log notification data when clicked in foreground
        console.log("📩 Notification Clicked (Foreground):", JSON.stringify(detail.notification, null, 2));

        const parsedData = Object.fromEntries(
          Object.entries(detail.notification.data).map(([key, value]) => [
            key,
            safeJsonParse(value),
          ])
        );

        // Handle UPDATE type notification
        if (parsedData.type === "UPDATE") {
          const url = Platform.OS === "ios" ? parsedData.iosUrl : parsedData.androidUrl;
          if (url) {
            console.log(`📲 Opening store URL: ${url}`);
            Linking.openURL(url)
              .then(() => console.log("📲 Successfully opened store URL"))
              .catch(err => console.error("📲 Error opening store URL:", err));
            return; // Exit early to prevent further navigation
          } else {
            console.warn("📲 No valid URL provided for UPDATE notification");
            return; // Exit early if no URL is available
          }
        }

        // Handle other notification types
        const data = {
          navigationId: parsedData.page || "Home",
          item: parsedData.id ? { id: parsedData.id } : parsedData.item || null,
          contentType: parsedData.contentType,
        };

        const deeplinkURL = buildDeepLinkFromNotificationData(data);

        if (deeplinkURL) {
          const navigationParams = parseDeepLinkUrl(deeplinkURL);
          if (navigationParams) {
            navigateToScreen(navigationParams.screen, navigationParams.params);
          }
        }
      }
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      // Log background notification data
      console.log("📩 Background Notification Received:", JSON.stringify(remoteMessage, null, 2));
    });

    return () => {
      unsubscribeFcm();
      unsubscribeNotifee();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.data) {
        const parsedData = Object.fromEntries(
          Object.entries(remoteMessage.data).map(([key, value]) => [
            key,
            safeJsonParse(value),
          ])
        );

        console.log("📩 Notification Opened (Background):", JSON.stringify(parsedData, null, 2));

        // Handle UPDATE type notification
        if (parsedData.type === "UPDATE") {
          const url = Platform.OS === "ios" ? parsedData.iosUrl : parsedData.androidUrl;
          if (url) {
            console.log(`📲 Opening store URL from notification: ${url}`);
            Linking.openURL(url)
              .then(() => console.log("📲 Successfully opened store URL"))
              .catch(err => console.error("📲 Error opening store URL:", err));
            return; // Prevent further navigation
          } else {
            console.warn("📲 No valid URL provided for UPDATE notification");
            return; // Prevent further navigation
          }
        }

        // Handle other notification types
        const data = {
          navigationId: parsedData.page || "Home",
          item: parsedData.id ? { id: parsedData.id } : parsedData.item || null,
          contentType: parsedData.contentType,
        };

        const deeplinkURL = buildDeepLinkFromNotificationData(data);
        if (deeplinkURL) {
          const navigationParams = parseDeepLinkUrl(deeplinkURL);
          if (navigationParams) {
            console.log("📲 Navigating to screen:", navigationParams.screen);
            navigateToScreen(navigationParams.screen, navigationParams.params);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCloseModal = () => setIsModalVisible(false);
  const handleCloseVersionModal = () => setIsVersionModalVisible(false);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {Platform.OS === "android" ? (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <NavigationContainer
              linking={linking}
              ref={navigationRef}
              onReady={() => {
                if (pendingNavigation) {
                  navigateToScreen(
                    pendingNavigation.screen,
                    pendingNavigation.params
                  );
                }
              }}
              onStateChange={async () => {
                const currentRoute = navigationRef.current?.getCurrentRoute();
                if (currentRoute?.name) {
                  console.log("🗺️ User navigated to:", currentRoute.name);
                  if (!__DEV__) {
                    Clarity.setCurrentScreenName(currentRoute.name);
                  }
                }
              }}
            >
              <PaperProvider>
                <Provider store={store}>
                  <FlashMessage position="top" />
                  <Stack.Navigator initialRouteName="SplashLogo">
                    <Stack.Screen
                      name="SplashLogo"
                      component={SplashLogo}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="AuthNav"
                      component={AuthNav}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="RegisterData"
                      component={RegisterData}
                      initialParams={linkData}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="AppNav"
                      component={AppNav}
                      options={{ headerShown: false }}
                    />
                  </Stack.Navigator>
                </Provider>
              </PaperProvider>
            </NavigationContainer>

            <LogoutModal
              visible={isModalVisible}
              onClose={handleCloseModal}
              onLogout={handleLogout}
              userDetails={userDetails}
            />
            <VersionCheckModal
              visible={isVersionModalVisible}
              onUpdate={handleUpdate}
              onClose={handleCloseVersionModal}
              versionInfo={versionInfo}
            />
          </View>
        </SafeAreaView>
      ) : (
        <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 40 : 0 }}>
          <NavigationContainer
            linking={linking}
            ref={navigationRef}
            onReady={() => {
              if (pendingNavigation) {
                navigateToScreen(
                  pendingNavigation.screen,
                  pendingNavigation.params
                );
              }
            }}
            onStateChange={async () => {
              const currentRoute = navigationRef.current?.getCurrentRoute();
              if (currentRoute?.name) {
                console.log("🗺️ User navigated to:", currentRoute.name);
                if (!__DEV__) {
                  Clarity.setCurrentScreenName(currentRoute.name);
                }
              }
            }}
          >
            <PaperProvider>
              <Provider store={store}>
                <FlashMessage position="top" />
                <Stack.Navigator initialRouteName="SplashLogo">
                  <Stack.Screen
                    name="SplashLogo"
                    component={SplashLogo}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="AuthNav"
                    component={AuthNav}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="RegisterData"
                    component={RegisterData}
                    initialParams={linkData}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="AppNav"
                    component={AppNav}
                    options={{ headerShown: false }}
                  />
                </Stack.Navigator>
              </Provider>
            </PaperProvider>
          </NavigationContainer>

          <LogoutModal
            visible={isModalVisible}
            onClose={handleCloseModal}
            onLogout={handleLogout}
            userDetails={userDetails}
          />
          <VersionCheckModal
            visible={isVersionModalVisible}
            onUpdate={handleUpdate}
            onClose={handleCloseVersionModal}
            versionInfo={versionInfo}
          />
        </View>
      )}
    </SafeAreaProvider>
  );
};

export default App;