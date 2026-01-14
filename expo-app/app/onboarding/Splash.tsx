
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { viewProfile, viewUserTest } from '@/src/apis/apiService';
import AppContainer from '@/src/components/AppContainer';
import { showToast } from '@/src/components/GlobalToast';
import { updateUserField } from '@/src/redux/userDetailsSlice';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { useDispatch } from 'react-redux';

const { height } = Dimensions.get('window');

interface TestItem {
  testName: string;
  isRequires: boolean;
  isSplash: boolean;
  open: boolean;
}

type AppRoute =
  | '/auth/Login'
  | '/onboarding'
  | '/home'
  | '/monthlyhappinessindex'
  | '/monthlywellbeingpulse'
  | '/personalitymap';

const Splash = () => {
  const { t } = useTranslation();
  const router = useRouter();
  /** 🔑 Used to cancel async flows */
  const flowIdRef = useRef(0);

  /** Animations */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(-height)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headingSlideAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();


  /** ---------------- API HELPERS ---------------- */

  const viewUserProfile = async (userId: string) => {
    try {
      const packageName =
        Application.applicationId || 'co.seabuddy.platform';
      const version =
        Application.nativeApplicationVersion || '1.0.0';
      const os = Platform.OS === 'ios' ? 'ios' : 'android';

      const apiResponse = await viewProfile({
        userId,
        os,
        packageName,
        version,
      });

      if (apiResponse?.data) {
        const object = apiResponse.data
        for (const property in object) {
          dispatch(updateUserField({ key: property, value: object[property] }))
        }
      }

      if (apiResponse?.success && apiResponse?.status === 200) {
        return apiResponse.data;
      } else {
        showToast.error(t('oops'), apiResponse?.message);
        return null;
      }
    } catch {
      showToast.error(t('oops'), t('somethingwentwrong'));
      return null;
    }
  };

  /** ---------------- MAIN FLOW ---------------- */

  const initializeAndNavigate = useCallback(
    async (flowId: number) => {
      try {
        /** Stop immediately if notification active */
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        await wait(4000);

        const userDetailsStr = await AsyncStorage.getItem('userDetails');
        if (flowId !== flowIdRef.current) return;

        if (!userDetailsStr) {
          router.replace('/auth/Login' as any);
          return;
        }

        const userDetails = JSON.parse(userDetailsStr);
        const userId = userDetails?.id;

        if (!userId) {
          router.replace('/auth/Login' as any);
          return;
        }

        const userData = await viewUserProfile(userId);
        if (flowId !== flowIdRef.current) return;

        if (!userData || userData.isProfileCompleted !== true) {
          router.replace('/onboarding' as any);
          return;
        }

        const response = await viewUserTest();
        if (flowId !== flowIdRef.current) return;

        if (response?.status === 200 && Array.isArray(response.data)) {
          const tests: TestItem[] = response.data;

          const targetTest = tests.find(
            test => test?.open && test?.isSplash
          );

          const getRoute = (testName: string): AppRoute => {
            switch (testName) {
              case 'Happiness':
                return '/monthlyhappinessindex';
              case 'POMS':
                return '/monthlywellbeingpulse';
              case 'Personality':
                return '/personalitymap';
              default:
                return '/home';
            }
          };

          if (targetTest) {
            router.replace({
              pathname: getRoute(targetTest.testName) as any,
              params: {
                showPopup: targetTest.isRequires.toString(),
                testName: targetTest.testName,
                testData: JSON.stringify(targetTest),
              },
            });
          } else {
            router.replace('/home' as any);
          }
        } else {
          showToast.error(t('oops'), response?.message);
          router.replace('/home' as any);
        }
      } catch (error) {
        console.error('Splash Initialization Error:', error);
        showToast.error(t('oops'), t('somethingwentwrong'));
        router.replace('/auth/Login' as any);
      }
    },
    [router, t]
  );

  /** ---------------- EFFECT: RESTART ON CHANGE ---------------- */

  useEffect(() => {
    // Cancel previous flow

    flowIdRef.current += 1;
    const currentFlowId = flowIdRef.current;

    initializeAndNavigate(currentFlowId);

    // Cleanup cancels async work
    return () => {
      flowIdRef.current += 1;
    };
  }, [initializeAndNavigate]);

  /** ---------------- ANIMATIONS ---------------- */

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

  /** ---------------- UI ---------------- */

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
            position: 'absolute',
            bottom: '20%',
            right: '10%',
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
            position: 'absolute',
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
    position: 'relative',
  },
  logoImage: {
    width: '100%',
    height: '95%',
    resizeMode: 'stretch',
    backgroundColor: 'white',
    borderBottomLeftRadius: 65,
    borderBottomRightRadius: 65,
  },
});

export default Splash;
