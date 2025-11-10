import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";
import React from "react";
import { Dimensions, StyleProp, StyleSheet, ViewStyle } from "react-native";

const { width, height } = Dimensions.get("window");

interface CustomLottieProps {
  type?: "default" | "fullscreen";
  componetHeight?: number;
  isBlurView?: boolean;
  customSyle?: StyleProp<ViewStyle>;
}

const CustomLottie: React.FC<CustomLottieProps> = ({
  type = "default",
  componetHeight,
  isBlurView = true,
  customSyle,
}) => {
  const styles = StyleSheet.create({
    lottie: {
      width: width,
      height: componetHeight ? componetHeight : height * 0.68,
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
      position: "absolute",
      bottom: 0,
    },
    blur: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(7, 34, 11, 0.62)",
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
    },
  });

  const lottieStyle =
    customSyle ||
    (type === "fullscreen" ? { height: "100%", width: width } : styles.lottie);

  return (
    <>
      <LottieView
        source={require("../../assets/Background.json")}
        autoPlay
        loop
        resizeMode="cover"
        style={lottieStyle}
        hardwareAccelerationAndroid
        enableMergePathsAndroidForKitKatAndAbove
      />

      {isBlurView && (
        <BlurView
          intensity={50} // similar to blurAmount
          tint="light"
          style={styles.blur}
        />
      )}
    </>
  );
};

export default CustomLottie;
