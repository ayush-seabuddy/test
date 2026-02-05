import GlobalButton from "@/src/components/GlobalButton";
import GlobalTextInput from "@/src/components/GlobalTextInput";
import { showToast } from "@/src/components/GlobalToast";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Check, Lock, Mail } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { login } from "../../src/apis/apiService";

const { height } = Dimensions.get("window");

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const { t } = useTranslation();

  const logoTranslateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.timing(logoTranslateY, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateEmail = (value: string): boolean => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
    return pattern.test(value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) setEmailError(t("emailvalidation"));
    else setEmailError("");
  };

  const isFormValid =
    email && validateEmail(email) && password.length >= 8 && termsAccepted;

  const handleLogin = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      const ExpoPushToken = await AsyncStorage.getItem("ExpoPushToken");

      const payload: {
        email: string;
        password: string;
        deviceToken?: string;
      } = { email, password };

      if (ExpoPushToken) payload.deviceToken = ExpoPushToken;

      const apiResponse = await login(payload);
      setLoading(false);

      if (apiResponse.success && apiResponse.status === 200) {
        showToast.success(t("loginsuccessful"), t("welcomeback"));

        await AsyncStorage.setItem(
          "userDetails",
          JSON.stringify(apiResponse.data)
        );

        apiResponse?.data.authToken &&
          (await AsyncStorage.setItem("authToken", apiResponse.data.authToken));
        apiResponse?.data.id &&
          (await AsyncStorage.setItem("userId", apiResponse.data.id));
        apiResponse?.data.shipId &&
          (await AsyncStorage.setItem("shipId", apiResponse.data.shipId));
        apiResponse?.data.employerId &&
          (await AsyncStorage.setItem(
            "employerId",
            apiResponse.data.employerId
          ));

        const storedData = await AsyncStorage.getItem("userDetails");
        const user = JSON.parse(storedData ?? "{}");

        if (
          user.isProfileCompleted &&
          (user.department === "Shore_Staff" ||
            user.isPersonalityTestCompleted)
        ) {
          router.replace("/home");
        } else if (user.isProfileCompleted) {
          router.replace("/personalitymap");
        } else {
          router.replace("/onboarding");
        }
      } else {
        showToast.error(t("oops"), apiResponse.message);
      }
    } catch {
      setLoading(false);
      showToast.error(t("error"), t("somethingwentwrong"));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : 'padding'}
    >
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <View style={styles.wrapper}>
          <View style={styles.backgroundOverlay} />
          <View style={styles.topSection} />

          <Animated.Image
            source={ImagesAssets.splashCaptainImage}
            style={[
              styles.logo,
              { transform: [{ translateY: logoTranslateY }] },
            ]}
          />

          <View style={styles.formCard}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View style={styles.formContent}>
                <View style={styles.header}>
                  <Text style={styles.title}>{t("welcome")}</Text>
                  <Text style={styles.subtitle}>
                    {t("logintoyouraccount")}
                  </Text>
                </View>

                <GlobalTextInput
                  placeholder={t("enteryouremail")}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Mail size={20} color={Colors.iconMuted} />}
                  error={email && emailError}
                />

                <GlobalTextInput
                  placeholder={t("enterpassword")}
                  value={password}
                  onChangeText={setPassword}
                  secure
                  leftIcon={<Lock size={20} color={Colors.iconMuted} />}
                  error={
                    password && password.length < 8
                      ? t("passwordshould8charlong")
                      : ""
                  }
                />

                <View style={styles.termsRow}>
                  <TouchableOpacity
                    onPress={() => setTermsAccepted(!termsAccepted)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        termsAccepted && styles.checkboxChecked,
                      ]}
                    >
                      {termsAccepted && (
                        <Check size={16} color={Colors.white} />
                      )}
                    </View>
                  </TouchableOpacity>

                  <Text style={styles.termsText}>{t("iacceptthe")}</Text>

                  <TouchableOpacity
                    onPress={() => router.push("../termsandcondition")}
                  >
                    <Text style={styles.termsLink}>
                      {t("termsandconditions")}
                    </Text>
                  </TouchableOpacity>
                </View>

                <GlobalButton
                  title={t("login")}
                  onPress={handleLogin}
                  buttonStyle={styles.loginButton}
                  loading={loading}
                  disabled={!isFormValid}
                />

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => router.push("/auth/ForgotPassword")}
                >
                  <Text style={styles.forgotPasswordText}>
                    {t("forgotPassword")}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const { height: h } = Dimensions.get("window");

const styles = StyleSheet.create({
  wrapper: { flex: 1, overflow: "hidden" },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
  },
  topSection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: h * 0.42,
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: "100%",
    height: "35%",
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 50,
  },
  formCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: h * 0.58,
    backgroundColor: Colors.loginformBackground,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 20,
  },
  formContent: { paddingBottom: 20, paddingHorizontal: 16 },
  header: { alignItems: "center", marginBottom: 12 },
  title: {
    lineHeight:20,
    fontFamily: "WhyteInktrap-Bold",
    fontSize: 20,
    paddingTop: Platform.OS === "android" ? 0 : 10,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    marginTop: 8,
    color: Colors.textPrimary,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 12,
    marginLeft: 6,
    color: Colors.textSecondary,
    fontFamily: "Poppins-Regular",
  },
  termsLink: {
    fontSize: 12,
    color: Colors.blueLink,
    fontFamily: "Poppins-Regular",
    marginLeft: 5,
    textDecorationLine: "underline",
  },
  forgotPassword: { marginTop: 14, alignItems: "center" },
  forgotPasswordText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: "Poppins-Regular",
  }, loginButton: {
    width: '100%'
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.lightGreen,
    borderColor: Colors.lightGreen,
  },
});
