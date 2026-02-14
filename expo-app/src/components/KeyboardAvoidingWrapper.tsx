import React, { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, View } from "react-native";

type KeyboardAvoidingWrapperProps = {
  children: React.ReactNode;
  keyboardVerticalOffset?: number;
  style?: any;
};

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  keyboardVerticalOffset = 0,
  style,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showListener = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(40);
    });
    const hideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={[{ flex: 1 }, style]}>
        {children}
      </View>
      {Platform.OS === "android" && keyboardHeight > 0 && (
        <View style={{ height: keyboardHeight, display: keyboardHeight === 0 ? "none" : "flex" }} />
      )}
    </KeyboardAvoidingView>
  );
};

export default KeyboardAvoidingWrapper;