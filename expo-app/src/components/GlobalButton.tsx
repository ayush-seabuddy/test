import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import Colors from "../utils/Colors";

interface GlobalButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const GlobalButton: React.FC<GlobalButtonProps> = ({
  title,
  loading = false,
  disabled = false,
  buttonStyle,
  textStyle,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        buttonStyle,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <Text
          style={[
            styles.buttonText,
            disabled && styles.buttonTextDisabled,
            textStyle, 
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default GlobalButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    height: 50,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
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
