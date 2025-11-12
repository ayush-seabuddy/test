import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Lock } from "lucide-react-native";
import CustomLottie from "@/src/components/CustomLottie";
import { useRouter } from "expo-router";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import Colors from "@/src/utils/Colors";
import { useTranslation } from "react-i18next";
import GlobalButton from "@/src/components/GlobalButton";
import GlobalTextInput from "@/src/components/GlobalTextInput";

const { width, height } = Dimensions.get("window");

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const translateY = useRef(new Animated.Value(height)).current;
  const { t } = useTranslation();

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Password validation
  const isValidPassword = (pwd: string): boolean => {
    return (
      pwd.length >= 8 &&
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[@$!%*?&]/.test(pwd)
    );
  };

  const passwordError =
    password.length > 0 && !isValidPassword(password)
      ? t("passwordvalidationerror")
      : undefined;

  const confirmPasswordError =
    confirmPassword.length > 0 && confirmPassword !== password
      ? t("passwords_do_not_match")
      : undefined;

  const isFormValid = isValidPassword(password) && password === confirmPassword && password.length > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <CustomLottie isBlurView={false} componetHeight={height * 0.78} />
        <View style={styles.topOverlay} />

        <Animated.Image
          source={ImagesAssets.splashCaptainImage}
          style={[styles.logo, { transform: [{ translateY }] }]}
        />

        <View style={styles.bottomCard}>
          <View style={styles.content}>
            <Text style={styles.title}>{t("setnewpassword")}</Text>
            <Text style={styles.subtitle}>{t("mustbeatleast8characters")}</Text>

            <GlobalTextInput
              placeholder={t("enterpassword")}
              value={password}
              onChangeText={setPassword}
              secure
              leftIcon={<Lock size={24} color={Colors.iconColor} />}
              error={passwordError}
              inputWrapperStyle={styles.inputWrapperStyle}
              inputStyle={styles.globalInputText}
              errorStyle={styles.globalErrorText}
            />

            <GlobalTextInput
              placeholder={t("confirmPassword")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secure
              leftIcon={<Lock size={24} color={Colors.iconColor} />}
              error={confirmPasswordError}
              inputWrapperStyle={styles.inputWrapperStyle}
              inputStyle={styles.globalInputText}
              errorStyle={styles.globalErrorText}
            />

            <GlobalButton
              title={t("resetPassword")}
              buttonStyle={{
                width: "100%",
                backgroundColor: isFormValid ? "#02130B" : "#808080",
                marginTop: 20,
              }}
            />

            <View style={styles.loginLink}>
              <Text style={styles.loginText}>{t("alreadyhaveanaccount")}</Text>
              <TouchableOpacity onPress={() => router.push("/auth/Login")}>
                <Text style={styles.loginLinkText}> {t("loginNow")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCCCCC",
  },
  inputWrapperStyle: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16
  },
  globalInputText: {
    fontSize: 15,
    color: "#000",
    paddingVertical: 0,
  },
  globalErrorText: {
    marginTop: 5,
    marginLeft: 0,
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.50,
    backgroundColor: Colors.captainanimatedlayoutbg,
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
    height: "56%",
    backgroundColor: Colors.loginformBackground,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  content: {
    marginTop: 30,
    paddingHorizontal: 30,
  },
  title: {
    fontFamily: "WhyteInktrap-Bold",
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: "center",
    paddingTop: Platform.OS === "android" ? 0 : 10,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: "center",
    marginVertical:14,
  },
  inputWrapper: {
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: "100%",
    borderRadius: 10,
    height: 50,
  },
  iconLeft: {
    marginLeft: 15,
    marginRight: 10,
  },
  iconRight: {
    marginRight: 15,
  },
  textInput: {
    flex: 1,
    color: "#000",
    fontFamily: "Poppins-Regular",
    fontSize: 15,
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
   marginTop: 5,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  loginText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#454545",
  },
  loginLinkText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#06361F",
  },
});