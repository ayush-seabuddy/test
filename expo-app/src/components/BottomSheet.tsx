import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
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
  const panResponderRef = useRef<any>(null);
  const initialYRef = useRef(0);

  // Setup PanResponder for drag to close functionality
  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt) => {
        // Only respond if dragging vertically (not horizontally)
        return Math.abs(evt.nativeEvent.dy) > 5;
      },
      onPanResponderGrant: (evt) => {
        initialYRef.current = evt.nativeEvent.pageY;
      },
      onPanResponderRelease: (evt) => {
        const finalY = evt.nativeEvent.pageY;
        const dragDistance = finalY - initialYRef.current;

        // If dragged down significantly (more than 50px), dismiss keyboard only
        if (dragDistance > 50) {
          Keyboard.dismiss();
        }
      },
    });
  }, [onClose]);

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
  // When keyboard is open, calculate sheet height from top 10% to keyboard
  // Available height = 90% of screen - keyboard height
  const dynamicSheetHeight =
    keyboardHeight > 0 
      ? SCREEN_HEIGHT * 0.9 - keyboardHeight
      : sheetHeight;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View
          style={[
            styles.sheet,
            {
              height: dynamicSheetHeight,
              ...(keyboardHeight > 0
                ? {
                  top: SCREEN_HEIGHT * 0.1,
                  bottom: keyboardHeight,
                }
                : {
                  bottom: 0,
                  top: undefined
                }
              ),
            }
          ]}
          {...panResponderRef.current?.panHandlers}
        >
          <View
            style={styles.handleContainer}
            {...panResponderRef.current?.panHandlers}
          >
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
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d0d0d0",
  },
});

export default BottomSheet;
