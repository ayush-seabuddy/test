


import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import CustomLottie from "@/src/components/CustomLottie";
import GlobalButton from "@/src/components/GlobalButton";
import GlobalTextInput from "@/src/components/GlobalTextInput";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { CheckSquare, Eye, EyeOff, Lock, Mail, Square, User } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import PhoneInput, { ICountry } from "react-native-international-phone-number";

const { height } = Dimensions.get("window");

const Signup = () => {
  const { t } = useTranslation();

  const translateY = useRef(new Animated.Value(height)).current;

  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [phoneInputValue, setPhoneInputValue] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);

  const [passwordStrength, setPasswordStrength] = useState("");

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const validatePassword = (val: string) => {
    const strong =
      val.length >= 8 &&
      /[A-Z]/.test(val) &&
      /[a-z]/.test(val) &&
      /\d/.test(val) &&
      /[!@#$%^&*]/.test(val);

    setPasswordStrength(strong ? "Strong" : "Weak");
  };

  const isFormValid =
    password.length >= 8 &&
    passwordStrength === "Strong" &&
    confirmPassword === password &&
    termsAccepted;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <CustomLottie isBlurView={Platform.OS === 'ios' ? true : false} componentHeight={height * 0.9} />
        <View style={styles.topOverlay} />
        <Animated.Image
          source={ImagesAssets.splashCaptainImage}
          style={[styles.logo, { transform: [{ translateY }] }]}
        />

        <View style={styles.bottomCard}>
          <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />

          <View style={styles.header}>
            <Text style={styles.title}>{t("register")}</Text>
            <Text style={styles.subtitle}>{t("createyouraccount")}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <GlobalTextInput
              value={name}
              placeholder={t("enteryourname")}
              editable={false}
              leftIcon={<User color="#888" size={20} />}
            />

            <GlobalTextInput
              value={email}
              placeholder={t("enteryouremail")}
              editable={false}
              leftIcon={<Mail color="#888" size={20} />}
            />

            {/* ✅ Phone Input with Auto Country Detection */}
            <View style={{ alignSelf: "center", marginVertical: 10 }}>
              <PhoneInput
                value={phoneInputValue}
                selectedCountry={selectedCountry}
                onChangePhoneNumber={setPhoneInputValue}
                onChangeSelectedCountry={setSelectedCountry}
                defaultCountry="SG"
                placeholder={t("enteryourphonenumber")}
                editable={false}
                phoneInputStyles={{
                  container: {
                    backgroundColor: "rgba(255,255,255,0.85)",
                    borderRadius: 5,
                    height: 50,
                    width: "100%",
                    borderWidth: 0,
                  },
                  flagContainer: {
                    backgroundColor: "rgba(255,255,255,0.85)",

                  },
                  callingCode: {
                    fontSize: 14,
                    color: "#888"
                  },
                  caret: {
                    fontSize: 14,
                    color: "#888",
                    marginLeft: 5,
                  },
                  divider: {
                    width: 1,
                    height: 20,
                    backgroundColor: "#C6C6C6",
                    marginHorizontal: 8,
                  },
                  flag: {
                    fontSize: 14,
                  },
                  input: {
                    fontSize: 14,
                    fontFamily: "Poppins-Regular",
                  },
                }}

              />
            </View>

            <GlobalTextInput
              placeholder={t("enterpassword")}
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
              leftIcon={<Lock size={20} color="#888" />}
              rightIcon={
                <TouchableOpacity onPress={() => setPasswordVisible(!isPasswordVisible)}>
                  {isPasswordVisible ? <Eye size={22} color="#888" /> : <EyeOff size={22} color="#888" />}
                </TouchableOpacity>
              }
            />

            {password.length > 0 && passwordStrength === "Weak" && (
              <Text style={styles.errorText}>{t("passwordvalidationerror")}</Text>
            )}

            <GlobalTextInput
              secureTextEntry={!isConfirmPasswordVisible}
              value={confirmPassword}
              placeholder={t("confirmPassword")}
              onChangeText={setConfirmPassword}
              leftIcon={<Lock size={20} color="#888" />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}
                >
                  {isConfirmPasswordVisible ? <Eye size={22} color="#888" /> : <EyeOff size={22} color="#888" />}
                </TouchableOpacity>
              }
            />

            {confirmPassword && confirmPassword !== password && (
              <Text style={styles.errorText}>{t("passwords_do_not_match")}</Text>
            )}

            {/* Terms */}
            <View style={styles.termsRow}>
              <TouchableOpacity onPress={() => setTermsAccepted(!termsAccepted)}>
                {termsAccepted ? <CheckSquare size={22} color="#8DAF02" /> : <Square size={22} />}
              </TouchableOpacity>
              <Text style={styles.termsText}>{t("iacceptthe")} </Text>
              <TouchableOpacity onPress={() => router.push("../termsandcondition")}>
                <Text style={styles.termsLink}>{t("termsandconditions")}</Text>
              </TouchableOpacity>
            </View>

            <GlobalButton title={t("register")} disabled={!isFormValid} buttonStyle={{ marginTop: 20, width: '100%' }} />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>{t("alreadyhaveanaccount")}</Text>
              <TouchableOpacity onPress={() => router.replace("/auth/Login")}>
                <Text style={styles.loginLink}>{t("loginNow")}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Signup;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCCCCC" },
  topOverlay: {
    width: "100%",
    height: "45%",
    backgroundColor: "#CCCCCC",
    position: "absolute",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    width: "100%",
    height: "35%",
    resizeMode: "contain",
    marginTop: 60,
  },
  bottomCard: {
    backgroundColor: Colors.loginformBackground,
    height: "65%",
    width: "100%",
    position: "absolute",
    bottom: 0,
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontFamily: "WhyteInktrap-Bold",
    fontSize: 20,
    color: "#161616",
    paddingVertical: Platform.OS === "ios" ? 5 : 0,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#161616",
    marginTop: 10,
  },
  scrollContent: { paddingBottom: 20 },
  inputWrapper: { alignItems: "center", marginTop: 10 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: "90%",
    borderRadius: 10,
    height: 50,
  },
  iconLeft: { marginLeft: 15 },
  iconRight: { marginRight: 15 },
  textInput: {
    flex: 1,
    color: "#000",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 12,
  },
  phoneInputContainer: {
    width: "90%",
    position: "relative",
  },
  phoneIconWrapper: {
    position: "absolute",
    left: 15,
    top: 15,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  termsText: {
    fontSize: 12,
    color: "#454545",
    fontFamily: "Poppins-Regular",
    marginLeft: 8,
  },
  termsLink: {
    fontSize: 12,
    color: "blue",
    fontFamily: "Poppins-Regular",
    textDecorationLine: "underline",
  },
  registerButton: { marginTop: height * 0.02 },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: height * 0.02,
    marginBottom: 30,
  },
  loginText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#808080",
  },
  loginLink: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#06361F",
    marginLeft: 5,
  },
});