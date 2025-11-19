import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import Colors from "@/src/utils/Colors";

// ✅ Custom Success Toast
export const SuccessToast = (props: any) => (
  <BaseToast
    {...props}
    style={[styles.toastContainer, { borderLeftColor: Colors.success || "#22c55e" }]}
    contentContainerStyle={{ paddingHorizontal: 15 }}
    text1Style={styles.title}
    text2Style={styles.message}
    text1NumberOfLines={1}
    text2NumberOfLines={2}
  />
);

// ✅ Custom Error Toast
export const ErrorToastComponent = (props: any) => (
  <ErrorToast
    {...props}
    style={[styles.toastContainer, { borderLeftColor: Colors.error || "#ef4444" }]}
    text1Style={styles.title}
    text2Style={styles.message}
  />
);

// ✅ Toast Config (used in <Toast config={toastConfig} />)
export const toastConfig = {
  success: (props: any) => <SuccessToast {...props} />,
  error: (props: any) => <ErrorToastComponent {...props} />,
};

// ✅ Global Toast trigger helper
export const showToast = {
  success: (title: string, message?: string) =>
    Toast.show({
      type: "success",
      text1: title,
      text2: message,
      position: "top",
      topOffset: 50,
      visibilityTime: 2500,
    }),
  error: (title: string, message?: string) =>
    Toast.show({
      type: "error",
      text1: title,
      text2: message,
      position: "top",
      topOffset: 50,
      visibilityTime: 3000,
    }),
};

const styles = StyleSheet.create({
  toastContainer: {
    borderLeftWidth: 6,
    borderRadius: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  message: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.grayDark || "#4B5563",
  },
});

export default Toast;
