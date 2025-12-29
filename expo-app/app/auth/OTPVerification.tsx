import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { Mail } from "lucide-react-native";
import CustomLottie from "@/src/components/CustomLottie";
import Colors from "@/src/utils/Colors";
import { useTranslation } from "react-i18next";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import GlobalButton from "@/src/components/GlobalButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import { showToast } from "@/src/components/GlobalToast";
import { forgotpassword, verifyotp } from "@/src/apis/apiService";

const { width, height } = Dimensions.get("window");

const OTPVerification = () => {
  const { email } = useLocalSearchParams();
  const emailStr = Array.isArray(email) ? email[0] : email || "";
  const [loading, setloading] = useState(false);
  const [otp, setOtp] = useState("");
  const translateY = useRef(new Animated.Value(height)).current;
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const verifyOTP = async () => {
    setloading(true);
    try {
      const apiResponse = await verifyotp({ email: emailStr, otp });
      setloading(false);
      if (apiResponse.success && apiResponse.status === 200) {
        showToast.success(t('success'), apiResponse.message);
        router.push({
          pathname: '/auth/ResetPassword',
          params: { email }
        });
      } else {
        showToast.error(t('oops'), apiResponse.message);
      }
    } catch (error) {
      setloading(false);
      showToast.error(
        t('error'),
        t('somethingwentwrong')
      );
    }
  };

  const resendOTP = async () => {
    setloading(true);
    try {
      const apiResponse = await forgotpassword({ email: emailStr });
      setloading(false);
      if (apiResponse.success && apiResponse.status === 200) {
        showToast.success(
          t('success'),
          apiResponse.message,
        );
      } else {
        showToast.error(
          t('oops'),
          apiResponse.message,
        );
      }
    } catch (error) {
      setloading(false);
      showToast.error(
        t('error'),
        t('somethingwentwrong')
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <CustomLottie isBlurView={false} />

          <View style={styles.topBackground} />
          <Animated.Image
            source={ImagesAssets.splashCaptainImage}
            style={[styles.logo, { transform: [{ translateY }] }]}
          />

          <View style={styles.bottomCard}>
            <View style={styles.cardContent}>
              <Text style={styles.title}>{t('emailverification')}</Text>

              <View style={styles.emailContainer}>
                <Mail size={20} color="#161616" style={styles.emailIcon} />
                <Text style={styles.subtitle}>
                  {t('wehavesentthecodedescription', { email: email })}
                </Text>
              </View>

              <View style={styles.otpContainer}>
                <OtpInput
                  autoFocus={false}
                  numberOfDigits={6}
                  focusColor={Colors.lightGreen}
                  onFilled={(value) => setOtp(value)}
                  onTextChange={(value) => setOtp(value)}
                  theme={{
                    pinCodeContainerStyle: styles.otpBox,
                    focusedPinCodeContainerStyle: styles.otpBoxFocused,
                    pinCodeTextStyle: styles.otpText,
                  }}
                />
              </View>

              <GlobalButton
                title={t('continue')}
                onPress={verifyOTP}
                buttonStyle={{ width: '90%' }}
                loading={loading}
                disabled={otp.length !== 6}
              />
              <TouchableOpacity style={styles.resendContainer} onPress={resendOTP}>
                <Text style={styles.resendText}>{t('clickheretoresend')}</Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginPrompt}>{t('alreadyhaveanaccount')}</Text>
                <TouchableOpacity onPress={() => { router.replace('/auth/Login'); }}>
                  <Text style={styles.loginLink}>
                    {t('loginNow')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default OTPVerification;

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
  },
  topBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#CCCCCC",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: "100%",
    height: "35%",
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 40,
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: Colors.loginformBackground,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    paddingTop: 30,
  },
  title: {
    fontFamily: "WhyteInktrap-Bold",
    fontSize: 20,
    color: "#161616",
    textAlign: "center",
    paddingTop: Platform.OS === "android" ? 0 : 10,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginHorizontal: 30,
  },
  emailIcon: {
    marginRight: 6,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    textAlign: 'center',
    marginTop: 3,
    color: "#161616",
  },
  otpContainer: {
    marginVertical: 20,
    marginHorizontal: 16,
  },
  otpBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderColor: "#E8E8E8",
    borderWidth: 1,
  },
  otpBoxFocused: {
    borderColor: Colors.lightGreen,
    borderWidth: 2,
    backgroundColor: Colors.white,
  },
  otpText: {
    marginTop: 5,
    color: "#454545",
    fontSize: 18,
    fontFamily: "Poppins-Medium",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  resendText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#505050",
    textDecorationLine: 'underline'
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  loginPrompt: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#454545",
  },
  loginLink: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#06361F",
    marginLeft: 5,
  },
});