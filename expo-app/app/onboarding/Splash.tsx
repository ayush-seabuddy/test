import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { viewUserTest } from '@/src/apis/apiService';
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

const Splash: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(-height)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headingSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade-in + slide down
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

    // Captain slide-in → Heading slide-out
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
          setTimeout(() => router.replace('/auth/Login'), 3000);
          return;
        }

        const userDetails = JSON.parse(userDetailsStr);
        const { isProfileCompleted } = userDetails;

        // 2. If profile not completed → Force onboarding
        if (isProfileCompleted !== true) {
          setTimeout(() => {
            router.replace('/onboarding'); 
          }, 3000);
          return;
        }

        // 3. Fetch test status from API
        const response = await viewUserTest();

        if (response?.status === 200 && Array.isArray(response?.data)) {
          // const tests: TestItem[] = response.data;

          // // Find test in priority order: Happiness → POMS → Personality
          // let targetTest: TestItem | undefined;

          // // Order matters: check index 0, then 1, then 2 (same as old code)
          // if (tests[0]?.open && tests[0]?.isSplash) {
          //   targetTest = tests[0];
          // } else if (tests[1]?.open && tests[1]?.isSplash) {
          //   targetTest = tests[1];
          // } else if (tests[2]?.open && tests[2]?.isSplash) {
          //   targetTest = tests[2];
          // }

          // // Map testName to route
          // const getRoute = (testName: string) => {
          //   switch (testName) {
          //     case 'Happiness':
          //       return '/monthlyhappinessindex';
          //     case 'POMS':
          //       return '/monthlywellbeingpulse';
          //     case 'Personality':
          //       return '/personalitymap';
          //     default:
          //       return '/home';
          //   }
          // };

          // // Navigate after splash animation
          // setTimeout(() => {
          //   if (targetTest) {
          //     const route = getRoute(targetTest.testName);

          //     router.replace({
          //       pathname: route,
          //       params: {
          //         showPopup: targetTest.isRequires.toString(),
          //         testName: targetTest.testName,
          //         testData: JSON.stringify(targetTest),
          //       },
          //     });
          //   } else {
          //     // No test to show → Go to main dashboard
          //     router.replace('/home');
          //   }
          // }, 3000);
          router.push('/auth/Login'); 
        } else {
          showToast.error(t('oops'), response?.message);
          setTimeout(() => router.replace('/home'), 3000);
        }
      } catch (error) {
        console.error('Splash Initialization Error:', error);
        showToast.error(t('oops'), t('somethingwentwrong'));
        setTimeout(() => router.replace('/auth/Login'), 3000);
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