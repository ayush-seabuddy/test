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
import { Mail, ArrowRight, LogIn } from "lucide-react-native";
import CustomLottie from "@/src/components/CustomLottie";
import Colors from "@/src/utils/Colors";
import { useTranslation } from "react-i18next";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import GlobalButton from "@/src/components/GlobalButton";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const OTPVerification = () => {

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

  return (

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
                {t('wehavesentthecodedescription', { email: 'harsh@mailsac.com' })}
              </Text>
            </View>

            <View style={styles.otpContainer}>
              <OtpInput
                numberOfDigits={6}
                focusColor={Colors.lightGreen}
                onFilled={setOtp}
                theme={{
                  pinCodeContainerStyle: styles.otpBox,
                  focusedPinCodeContainerStyle: styles.otpBoxFocused,
                  pinCodeTextStyle: styles.otpText,
                }}
              />
            </View>

            <GlobalButton
              title={t('continue')}
              onPress={() => {

              }}
            />
            <TouchableOpacity style={styles.resendContainer}>
              <Text style={styles.resendText}>{t('clickheretoresend')}</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginPrompt}>{t('alreadyhaveanaccount')}</Text>
              <TouchableOpacity onPress={() => {router.push('/auth/Login')}}>
                <Text style={styles.loginLink}>
                  {t('loginNow')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default OTPVerification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCCCCC",
  },
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
    marginTop: 60,
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
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
  },
  emailIcon: {
    marginRight: 6,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
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
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    marginHorizontal: 22,
    borderRadius: 10,
    marginTop: 30,
  },
  buttonActive: {
    backgroundColor: "#02130B",
  },
  buttonInactive: {
    backgroundColor: "#808080",
  },
  continueText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginRight: 8,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  resendText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#505050",
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
    flexDirection: "row",
    alignItems: "center",
  },
});