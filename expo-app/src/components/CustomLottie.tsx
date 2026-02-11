import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";
import React from "react";
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Colors from "../utils/Colors";

const { width, height } = Dimensions.get("window");

type CustomLottieProps = {
  type?: "default" | "fullscreen";
  componentHeight?: number;
  isBlurView?: boolean;
  customSyle?: StyleProp<ViewStyle>;
};

const CustomLottie: React.FC<CustomLottieProps> = ({
  type = "default",
  componentHeight,
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
      height: componentHeight ?? height * 0.68,
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
        <BlurView style={styles.blurView} tint="light" intensity={100} />
      )}
    </View>
  );
};

export default CustomLottie;
