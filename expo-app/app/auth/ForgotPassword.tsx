import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Mail } from "lucide-react-native";
import GlobalButton from "@/src/components/GlobalButton";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { useTranslation } from "react-i18next";


const { width, height } = Dimensions.get("window");

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useTranslation();

  // Email validation
  const validateEmail = (input: string) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(input);
  };

  const handleEmailChange = (input: string) => {
    setEmail(input);
    if (input && !validateEmail(input)) {
      setErrorMessage("Please enter a valid email address");
    } else {
      setErrorMessage("");
    }
  };

  const handleSubmit = () => {
    if (validateEmail(email)) {

    }
  };

  const isValid = email && validateEmail(email);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Logo */}
          <Image
            source={ImagesAssets.splashCaptainImage}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formContent}>
              <Text style={styles.title}>{t('forgotPassword')}</Text>
              <Text style={styles.subtitle}>
                {t('forgotpasswordDescription')}
              </Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Mail size={23} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={t('enteryouremail')}
                  placeholderTextColor="#B7B7B7"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Error Message */}
              {email.length > 0 && errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {/* Submit Button */}
              <GlobalButton
                title={t('sendresetlink')}
                onPress={handleSubmit}
                disabled={!isValid}
                style={isValid ? styles.activeButton : styles.disabledButton}
              />

              {/* Login Link */}
              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginText}>{t('alreadyhaveanaccount')}</Text>
                <TouchableOpacity onPress={() => { }}>
                  <Text style={styles.loginLink}>{t('loginNow')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCCCCC",
  },
  inner: {
    flex: 1,
  },
  logo: {
    width: "100%",
    height: "35%",
    alignSelf: "center",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: "90%",
    height: 50,
    borderRadius: 10,
    marginTop: 30,
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: "#000",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    marginTop: 5,
    alignSelf: "flex-start",
    marginLeft: 22,
  },
  activeButton: {
    backgroundColor: "#02130B",
    marginHorizontal: 22,
    marginTop: 30,
  },
  disabledButton: {
    backgroundColor: "#808080",
    marginHorizontal: 22,
    marginTop: 30,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
  },
  loginLinkContainer: {
    flexDirection: "row",
    marginTop: "45%",
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