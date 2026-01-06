import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: ("60%" | "80%" | number)[];
};

const BottomSheet: React.FC<Props> = ({
  visible,
  onClose,
  children,
  snapPoints = ["60%", "80%"],
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  const getHeight = (point: string | number): number => {
    if (typeof point === "number") return point;
    
    // Parse percentage strings
    if (typeof point === "string" && point.endsWith("%")) {
      const percentage = parseFloat(point) / 100;
      return SCREEN_HEIGHT * percentage;
    }
    
    return SCREEN_HEIGHT * 0.2; // Default fallback
  };

  const sheetHeight = getHeight(snapPoints[0]);

  const dynamicBehavior = keyboardHeight > 0
    ? (Platform.OS === "ios" ? "padding" : "height")
    : undefined;

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={dynamicBehavior}
      >
        <View
          style={[
            styles.sheet,
            { height: sheetHeight },
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <View style={{ flex: 1 }}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};


const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 5,
  },
  handle: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#ccc",
  },
});

export default BottomSheet;