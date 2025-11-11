// src/components/common/GlobalButton.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";
import Colors from "../utils/Colors";

interface GlobalButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
}

const GlobalButton: React.FC<GlobalButtonProps> = ({
  title,
  loading = false,
  disabled = false,
  style,
  ...rest
}) => {
  const buttonStyle = [
    styles.button,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyle = [
    styles.buttonText,
    disabled && styles.buttonTextDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default GlobalButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 10,
  },
  buttonDisabled: {
    backgroundColor: Colors.disabled,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
  },
  buttonTextDisabled: {
    color: Colors.white,
    opacity: 0.7,
  },
});