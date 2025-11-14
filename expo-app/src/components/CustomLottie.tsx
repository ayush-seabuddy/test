import React from "react";
import LottieView from "lottie-react-native";
import {
  Dimensions,
  Platform,
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
} from "react-native";
import Colors from "../utils/Colors";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

type CustomLottieProps = {
  type?: "default" | "fullscreen";
  componetHeight?: number;
  isBlurView?: boolean;
  customSyle?: StyleProp<ViewStyle>;
};

const CustomLottie: React.FC<CustomLottieProps> = ({
  type = "default",
  componetHeight,
  isBlurView = true,
  customSyle,
}) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    lottieContainer: {
      width: width,
      height: componetHeight ?? height * 0.68,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      overflow: "hidden",
      position: "absolute",
      bottom: 0,
    },
    blurView: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(7, 34, 11, 0.62)",
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
    },
  });

  const lottieSource = require("../../assets/Background.json");

  return (
    <View
      style={[
        styles.lottieContainer,
        customSyle,
        type === "fullscreen" && { height: "100%" },
      ]}
    >
      <LottieView
        source={lottieSource}
        autoPlay
        loop
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
        hardwareAccelerationAndroid
        enableMergePathsAndroidForKitKatAndAbove
      />

      {isBlurView && (
        <BlurView
          style={styles.blurView}
          tint="light"
          intensity={100}
        />
      )}
    </View>
  );
};

export default CustomLottie;
