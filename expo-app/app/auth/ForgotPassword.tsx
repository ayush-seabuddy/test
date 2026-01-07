import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { Mail } from "lucide-react-native";
import GlobalButton from "@/src/components/GlobalButton";
import GlobalTextInput from "@/src/components/GlobalTextInput";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import Colors from "@/src/utils/Colors";
import { forgotpassword } from "../../src/apis/apiService";
import { showToast } from "@/src/components/GlobalToast";
import KeyboardWrapper from "@/src/components/KeyboardWrapper";

const { width, height } = Dimensions.get("window");

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setloading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const translateY = useRef(new Animated.Value(height)).current;

  const validateEmail = (input: string) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(input);
  };

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEmailChange = (input: string) => {
    setEmail(input);
    if (input && !validateEmail(input)) {
      setEmailError(t("emailvalidation"));
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) return;
    setloading(true);
    try {
      const apiResponse = await forgotpassword({ email });
      setloading(false);
      if (apiResponse.success && apiResponse.status === 200) {
        showToast.success(
          t('success'),
          apiResponse.message,
        )
        router.push({
          pathname: '/auth/OTPVerification',
          params: { email },
        });
      }
      else {
        showToast.error(
          t('oops'),
          apiResponse.message,
        )
      }
    }
    catch (error) {
      setloading(false);
      showToast.error(
        t('error'),
        t('somethingwentwrong')
      );
    }

  };

  const isValid = email && validateEmail(email);

  return (
    <KeyboardWrapper>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Logo */}
          <Animated.Image
            source={ImagesAssets.splashCaptainImage}
            style={[styles.logo, { transform: [{ translateY: translateY }] }]}
          />

          {/* Bottom Card */}
          <View style={styles.formCard}>
            <View style={styles.formContent}>
              <Text style={styles.title}>{t("forgotPassword")}</Text>
              <Text style={styles.subtitle}>
                {t("forgotpasswordDescription")}
              </Text>

              {/* Email Input */}
              <GlobalTextInput
                placeholder={t("enteryouremail")}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={{ width: '90%', marginTop: 30, alignItems: 'center' }}
                leftIcon={<Mail size={20} color={Colors.iconMuted} />}
                error={email && emailError}
              />

              {/* Submit Button */}
              <GlobalButton
                title={t("sendresetlink")}
                onPress={handleSubmit}
                disabled={!isValid}
                loading={loading}
                buttonStyle={{ width: '90%', backgroundColor: isValid ? "#02130B" : "#808080" }}
              />

              {/* Login Navigation */}
              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginText}>{t("alreadyhaveanaccount")}</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.loginLink}>{t("loginNow")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardWrapper>

  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCCCCC" },
  logo: {
    width: "100%",
    height: "35%",
    alignSelf: "center",
    resizeMode: "contain",
    marginTop: 50,
  },
  formCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  formContent: {
    flex: 1,
    paddingTop: 30,
    alignItems: "center",
  },
  title: {
    fontFamily: "WhyteInktrap-Bold",
    fontSize: 20,
    lineHeight: 30,
    color: "#161616",
    paddingTop: Platform.OS === "android" ? 0 : 10,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#161616",
    marginTop: 13,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  loginLinkContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginHorizontal: 30,
  },
  loginText: {
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
