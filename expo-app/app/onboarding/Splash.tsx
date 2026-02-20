import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Linking,
} from "react-native";

import {
  getapplastversion,
  viewProfile,
  viewUserTest,
} from "@/src/apis/apiService";
import AppContainer from "@/src/components/AppContainer";
import { updateUserField } from "@/src/redux/userDetailsSlice";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { useDispatch } from "react-redux";
import { usePostHog } from "posthog-react-native";
import { clearAllChatLists } from "@/src/redux/chatListSlice";
import Colors from "@/src/utils/Colors";
import { Logger } from "@/src/utils/logger";

const { height, width } = Dimensions.get("window");

interface TestItem {
  testName: string;
  isRequires: boolean;
  isSplash: boolean;
  open: boolean;
}

type AppRoute =
  | "/auth/Login"
  | "/onboarding"
  | "/home"
  | "/monthlyhappinessindex"
  | "/monthlywellbeingpulse"
  | "/personalitymap";

const Splash = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const posthog = usePostHog();

  const flowIdRef = useRef(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(-height)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headingSlideAnim = useRef(new Animated.Value(0)).current;

  const [isVersionModalVisible, setIsVersionModalVisible] = useState(false);
  const [versionInfo, setVersionInfo] = useState<any>(null);

  const forceLogout = useCallback(async () => {
    try {
      const expoPushToken = await AsyncStorage.getItem("ExpoPushToken");

      posthog?.reset?.();
      await AsyncStorage.clear();

      if (expoPushToken) {
        await AsyncStorage.setItem("ExpoPushToken", expoPushToken);
      }

      dispatch(clearAllChatLists());
      router.replace("/auth/Login");
    } catch (error) {
      Logger.error("Force logout failed:", { Error: String(error) });
    }
  }, [dispatch, router]);

  const compareVersions = (current: string, latest: string) => {
    const currentParts = current.split(".").map(Number);
    const latestParts = latest.split(".").map(Number);

    for (
      let i = 0;
      i < Math.max(currentParts.length, latestParts.length);
      i++
    ) {
      const c = currentParts[i] || 0;
      const l = latestParts[i] || 0;

      if (c < l) return true;
      if (c > l) return false;
    }
    return false;
  };

  const checkAppVersion = async () => {
    try {
      const currentVersion = (
        Application.nativeApplicationVersion || "1.0.0"
      ).trim();

      const apiResponse = await getapplastversion();

      Logger.info("🌐 Version API Response:", { Info: String(apiResponse) });

      if (apiResponse?.status === 200 && apiResponse?.data) {
        const platformKey = Platform.OS === "ios" ? "ios" : "android";
        const platformData = apiResponse.data[platformKey];

        const latestVersion = platformData.lastVersion?.trim();

        if (!latestVersion) return false;

        const needsUpdate = compareVersions(currentVersion, latestVersion);
        const isPopUp =
          platformData.isPopUp === true || platformData.isPopUp === "true";

        Logger.info("📱 Installed:", { Info: String(currentVersion) });
        Logger.info("🌐 Latest:", latestVersion);
        Logger.info("🆙 Needs Update:", { Info: String(needsUpdate) });
        Logger.info("📢 isPopUp:", { Info: String(isPopUp) });

        if (isPopUp && needsUpdate) {
          setVersionInfo(platformData);
          setIsVersionModalVisible(true);
          return true;
        }
      }
    } catch (error) {
      Logger.warn("⚠️ Version Check Failed → Continuing App Flow");
    }

    return false;
  };

  const handleUpdate = () => {
    if (versionInfo?.url) {
      Linking.openURL(versionInfo.url).catch((err: Error) =>
        Logger.error("Error opening store:", { Error: String(err) }),
      );
    }
  };

  const viewUserProfile = async (userId: string) => {
    try {
      const packageName = Application.applicationId || "co.seabuddy.platform";
      const version = Application.nativeApplicationVersion || "1.0.0";
      const os = Platform.OS === "ios" ? "ios" : "android";

      const apiResponse = await viewProfile({
        userId,
        os,
        packageName,
        version,
      });

      if (apiResponse?.status === 404) {
        await forceLogout();
        return null;
      }

      if (apiResponse?.data) {
        await AsyncStorage.setItem(
          "cachedUserProfile",
          JSON.stringify(apiResponse.data),
        );

        for (const property in apiResponse.data) {
          dispatch(
            updateUserField({
              key: property,
              value: apiResponse.data[property],
            }),
          );
        }
      }

      return apiResponse?.success ? apiResponse.data : null;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        await forceLogout();
        return null;
      }

      const cachedProfile = await AsyncStorage.getItem("cachedUserProfile");
      return cachedProfile ? JSON.parse(cachedProfile) : null;
    }
  };

  const initializeAndNavigate = useCallback(
    async (flowId: number) => {
      try {
        const wait = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));

        const shouldBlock = await checkAppVersion();
        if (shouldBlock) return;

        await wait(4000);
        if (flowId !== flowIdRef.current) return;

        const userDetailsStr = await AsyncStorage.getItem("userDetails");

        if (!userDetailsStr) {
          await forceLogout();
          return;
        }

        const userDetails = JSON.parse(userDetailsStr);
        const userId = userDetails?.id;

        if (!userId) {
          await forceLogout();
          return;
        }

        const userData = await viewUserProfile(userId);
        if (flowId !== flowIdRef.current) return;

        if (userData && !userData.isProfileCompleted) {
          router.replace("/onboarding");
          return;
        }

        const response = await viewUserTest();
        if (flowId !== flowIdRef.current) return;

        if (response?.status === 200 && Array.isArray(response.data)) {
          const tests: TestItem[] = response.data;
          const targetTest = tests.find((test) => test?.open && test?.isSplash);

          const getRoute = (testName: string): AppRoute => {
            switch (testName) {
              case "Happiness":
                return "/monthlyhappinessindex";
              case "POMS":
                return "/monthlywellbeingpulse";
              case "Personality":
                return "/personalitymap";
              default:
                return "/home";
            }
          };

          router.replace(targetTest ? getRoute(targetTest.testName) : "/home");
        } else {
          router.replace("/home");
        }
      } catch (error) {
        Logger.error("Splash Initialization Error:", { Error: String(error) });
        await forceLogout();
      }
    },
    [router, forceLogout],
  );

  useEffect(() => {
    flowIdRef.current += 1;
    const currentFlowId = flowIdRef.current;

    initializeAndNavigate(currentFlowId);

    return () => {
      flowIdRef.current += 1;
    };
  }, [initializeAndNavigate]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(headingSlideAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <AppContainer>
      <StatusBar backgroundColor="#ECECEC99" barStyle="dark-content" />

      <View style={styles.container}>
        <Animated.View style={styles.logoWrapper}>
          <Image
            source={ImagesAssets.splashHeadingImage}
            style={styles.logoImage}
          />
        </Animated.View>

        <Animated.View style={styles.captainWrapper}>
          <Image
            source={ImagesAssets.splashCaptainImage}
            style={styles.captainImage}
          />
        </Animated.View>
      </View>

      <Modal visible={isVersionModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.titleText}>
              {versionInfo?.isRequired
                ? t("updaterequired")
                : t("updateavailable")}
            </Text>

            <Text style={styles.descriptionText}>
              {versionInfo?.responseMessage}
            </Text>

            <View style={styles.buttonRow}>
              {!versionInfo?.isRequired && (
                <TouchableOpacity
                  style={[styles.button, styles.laterButton]}
                  onPress={() => setIsVersionModalVisible(false)}
                >
                  <Text style={styles.laterButtonText}>{t("later")}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.updateButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.updateButtonText}>{t("update")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoWrapper: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  logoImage: {
    width: "100%",
    height: "95%",
    resizeMode: "stretch",
    backgroundColor: "white",
    borderBottomLeftRadius: 65,
    borderBottomRightRadius: 65,
  },
  captainWrapper: {
    position: "absolute",
    bottom: "20%",
    right: "10%",
  },
  captainImage: {
    width: 120,
    height: 160,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
  },
  titleText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    marginVertical: 10,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 10,
  },
  laterButton: {
    backgroundColor: "#EEE",
  },
  updateButton: {
    backgroundColor: Colors.lightGreen,
  },
  laterButtonText: {
    fontFamily: "Poppins-Regular",
  },
  updateButtonText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
  },
});

export default Splash;
