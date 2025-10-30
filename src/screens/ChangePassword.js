import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { TextInput, Text } from "react-native-paper";
import ProfileSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import Toast from "react-native-toast-message";
import Loader from "../component/Loader";
import CustomLottie from "../component/CustomLottie";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { apiServerUrl } from "../Api";

const { height, width } = Dimensions.get("screen");

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Real-time field validation
  const validateField = (field, value) => {
    switch (field) {
      case "currentPassword":
        return value ? "" : "Current password is required.";
      case "newPassword":
        if (!value) return "New password is required.";
        return value.length >= 6 ? "" : "New password must be at least 6 characters.";
      case "confirmPassword":
        return value === newPassword ? "" : "Passwords do not match.";
      default:
        return "";
    }
  };

  const handleCurrentPasswordChange = (text) => {
    setCurrentPassword(text);
    setErrors((prev) => ({
      ...prev,
      currentPassword: validateField("currentPassword", text),
    }));
  };

  const handleNewPasswordChange = (text) => {
    setNewPassword(text);
    setErrors((prev) => ({
      ...prev,
      newPassword: validateField("newPassword", text),
      confirmPassword: validateField("confirmPassword", confirmPassword),
    }));
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateField("confirmPassword", text),
    }));
  };

  const handleChangePassword = async () => {
    // Final validation before API call
    const finalErrors = {
      currentPassword: validateField("currentPassword", currentPassword),
      newPassword: validateField("newPassword", newPassword),
      confirmPassword: validateField("confirmPassword", confirmPassword),
    };
    setErrors(finalErrors);

    if (Object.values(finalErrors).some((e) => e)) return;

    try {
      setLoading(true);
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);

      const requestBody = {
        currentPassword,
        newPassword,
      };

      const response = await axios.post(
        `${apiServerUrl}/user/changePassword`,
        requestBody,
        {
          headers: {
            authToken: userDetails.authToken,
          },
        }
      );

      if (response.data.responseCode === 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data.responseMessage,
          autoHide: true,
          visibilityTime: 2000,
          text1Style: {
            fontFamily: "WhyteInkTrap-Bold",
            fontSize: 16,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
          text2Style: {
            fontFamily: "WhyteInkTrap-Regular",
            fontSize: 14,
            color: "#000",
            paddingTop: Platform.OS === "ios" ? 8 : 0,
          },
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.data.responseMessage,
          autoHide: true,
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error changing password",
        text2: error.response?.data?.responseMessage || error.message,
        autoHide: true,
        visibilityTime: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProfileSettingHeader navigation={navigation} title="Change Password" />
      {loading && <Loader />}
      <View style={{ flex: 1, padding: 14 }}>
        {/* Current Password */}
        <TextInput
          label="Current Password"
          value={currentPassword}
          onChangeText={handleCurrentPasswordChange}
          secureTextEntry={!showCurrent}
          mode="outlined"
          style={styles.input}
          right={
            <TextInput.Icon
              icon={showCurrent ? "eye-off" : "eye"}
              onPress={() => setShowCurrent(!showCurrent)}
            />
          }
        />
        {errors.currentPassword ? (
          <Text style={styles.errorText}>{errors.currentPassword}</Text>
        ) : null}

        {/* New Password */}
        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={handleNewPasswordChange}
          secureTextEntry={!showNew}
          mode="outlined"
          style={styles.input}
          right={
            <TextInput.Icon
              icon={showNew ? "eye-off" : "eye"}
              onPress={() => setShowNew(!showNew)}
            />
          }
        />
        {errors.newPassword ? (
          <Text style={styles.errorText}>{errors.newPassword}</Text>
        ) : null}

        {/* Confirm Password */}
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          secureTextEntry={!showConfirm}
          mode="outlined"
          style={styles.input}
          right={
            <TextInput.Icon
              icon={showConfirm ? "eye-off" : "eye"}
              onPress={() => setShowConfirm(!showConfirm)}
            />
          }
        />
        {errors.confirmPassword ? (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        ) : null}

        {/* Submit */}
        <TouchableOpacity onPress={handleChangePassword} style={styles.button}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      <Toast />
      <View style={styles.lottieContainer}>
        <CustomLottie />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 10,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginBottom: 6,
  },
  button: {
    borderRadius: 8,
    marginVertical: 20,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  buttonText: {
    color: "#fff",
    lineHeight: 27,
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    fontSize: 18,
  },
  lottieContainer: {
    backgroundColor: "#c1c1c1",
    overflow: "hidden",
    height: "50%",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    zIndex: -1,
    position: "absolute",
    bottom: 0,
  },
});

export default ChangePasswordScreen;
