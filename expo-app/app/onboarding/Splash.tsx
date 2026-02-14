import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import { viewProfile, viewUserTest } from "@/src/apis/apiService";
import AppContainer from "@/src/components/AppContainer";
import { updateUserField } from "@/src/redux/userDetailsSlice";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { useDispatch } from "react-redux";
import { usePostHog } from "posthog-react-native";
import { clearAllChatLists } from "@/src/redux/chatListSlice";

const { height } = Dimensions.get("window");

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

  const flowIdRef = useRef(0);
  const posthog = usePostHog();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(-height)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headingSlideAnim = useRef(new Animated.Value(0)).current;

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
      console.error("Force logout failed:", error);
    }
  }, [dispatch, router]);

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

      if (apiResponse?.success && apiResponse?.status === 200) {
        return apiResponse.data;
      }

      return null;
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

        await wait(4000);

        if (flowId !== flowIdRef.current) return;

        const userDetailsStr = await AsyncStorage.getItem("userDetails");

        if (!userDetailsStr) {
          await forceLogout();
          return;
        }

        const userDetails = JSON.parse(userDetailsStr);

        const userId = userDetails?.id;
        const shipId = userDetails?.shipId;
        const employerId = userDetails?.employerId;

        if (!userId) {
          await forceLogout();
          return;
        }

        await AsyncStorage.setItem("userId", userId.toString());

        if (shipId) {
          await AsyncStorage.setItem("shipId", shipId.toString());
        }

        if (employerId) {
          await AsyncStorage.setItem("employerId", employerId.toString());
        }

        if (userDetails?.email) {
          posthog?.identify?.(userDetails.email, {
            email: userDetails.email,
            name: userDetails.name,
            userId: userDetails.id,
            shipId: shipId,
            employerId: employerId,
          });
        }

        const userData = await viewUserProfile(userId);

        if (flowId !== flowIdRef.current) return;

        if (userData && userData.isProfileCompleted !== true) {
          router.replace("/onboarding");
          return;
        }

        const response = await viewUserTest();

        if (flowId !== flowIdRef.current) return;

        if (response?.status === 404) {
          await forceLogout();
          return;
        }

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

          if (targetTest) {
            router.replace({
              pathname: getRoute(targetTest.testName),
              params: {
                showPopup: targetTest.isRequires.toString(),
                testName: targetTest.testName,
                testData: JSON.stringify(targetTest),
              },
            });
          } else {
            router.replace("/home");
          }
        } else {
          router.replace("/home");
        }
      } catch (error) {
        console.error("Splash Initialization Error:", error);
        await forceLogout();
      }
    },
    [router, viewUserProfile, forceLogout, posthog],
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
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          }}
        >
          <Image
            source={ImagesAssets.splashHeadingImage}
            style={styles.logoImage}
          />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            zIndex: 7,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              },
            ],
          }}
        >
          <Image
            source={ImagesAssets.splashCaptainImage}
            style={{ width: 120, height: 160 }}
          />
        </Animated.View>

        <Animated.View
          style={{
            position: "absolute",
            bottom: 300,
            right: 50,
            zIndex: 8,
            transform: [
              {
                translateY: headingSlideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -400],
                }),
              },
            ],
          }}
        >
          <Image
            source={ImagesAssets.splashHeadingImage}
            style={styles.logoImage}
          />
        </Animated.View>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  logoImage: {
    width: "100%",
    height: "95%",
    resizeMode: "stretch",
    backgroundColor: "white",
    borderBottomLeftRadius: 65,
    borderBottomRightRadius: 65,
  },
});

export default Splash;
