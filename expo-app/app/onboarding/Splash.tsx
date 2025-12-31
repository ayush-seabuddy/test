import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';

import { viewProfile, viewUserTest } from '@/src/apis/apiService';
import AppContainer from '@/src/components/AppContainer';
import { showToast } from '@/src/components/GlobalToast';
import { ImagesAssets } from '@/src/utils/ImageAssets';

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

const Splash: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(-height)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headingSlideAnim = useRef(new Animated.Value(0)).current;

  const viewUserProfile = async (userId: string) => {
    try {
      const packageName = Application.applicationId || 'co.seabuddy.platform';
      const version = Application.nativeApplicationVersion || '1.0.0';
      const os = Platform.OS === 'ios' ? 'ios' : 'android';

      const apiResponse = await viewProfile({
        userId,
        os,
        packageName,
        version,
      });

      if (apiResponse.success && apiResponse.status == 200) {
      } else {
        showToast.error(t('oops'), apiResponse.message);
      }
    } catch {
      showToast.error(t('oops'), t('somethingwentwrong'));
    }
  };

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

  useEffect(() => {
    const initializeAndNavigate = async () => {
      try {
        // 1. Check if user is logged in
        const userDetailsStr = await AsyncStorage.getItem('userDetails');
        if (!userDetailsStr) {
          // No user → Go to login
          setTimeout(() => router.replace('/auth/Login' as any), 3000);
          return;
        }

        const userDetails = JSON.parse(userDetailsStr);
        const { isProfileCompleted, id: userId } = userDetails;

        // 2. Call viewUserProfile API with all required parameters
        if (userId) {
          await viewUserProfile(userId);
        }

        // 3. If profile not completed → Force onboarding
        if (isProfileCompleted !== true) {
          setTimeout(() => {
            router.replace('/onboarding' as any);
          }, 3000);
          return;
        }

        // 4. Fetch test status from API
        const response = await viewUserTest();

        if (response?.status === 200 && Array.isArray(response?.data)) {
          const tests: TestItem[] = response.data;

          // Find test in priority order: Happiness → POMS → Personality
          let targetTest: TestItem | undefined;

          // Check tests in priority order
          for (let i = 0; i < Math.min(tests.length, 3); i++) {
            if (tests[i]?.open && tests[i]?.isSplash) {
              targetTest = tests[i];
              break;
            }
          }

          // Map testName to route with proper typing
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

          // Navigate after splash animation
          setTimeout(() => {
            if (targetTest) {
              const route = getRoute(targetTest.testName);

              // Type assertion to fix TypeScript error
              router.replace({
                pathname: route as any,
                params: {
                  showPopup: targetTest.isRequires.toString(),
                  testName: targetTest.testName,
                  testData: JSON.stringify(targetTest),
                },
              });
            } else {
              // No test to show → Go to main dashboard
              router.replace('/home' as any);
            }
          }, 3000);
        } else {
          showToast.error(t('oops'), response?.message);
          setTimeout(() => router.replace('/home' as any), 3000);
        }
      } catch (error) {
        console.error('Splash Initialization Error:', error);
        showToast.error(t('oops'), t('somethingwentwrong'));
        setTimeout(() => router.replace('/auth/Login' as any), 3000);
      }
    };

    initializeAndNavigate();
  }, [router, t]);

  return (
    <AppContainer>
      <StatusBar backgroundColor="#ECECEC99" barStyle="dark-content" />

      <View style={styles.container}>
        {/* Main Logo */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          }}
        >
          <Image source={ImagesAssets.splashHeadingImage} style={styles.logoImage} />
        </Animated.View>

        {/* Captain Character */}
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

        {/* Sliding Out Heading */}
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
          <Image source={ImagesAssets.splashHeadingImage} style={styles.logoImage} />
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