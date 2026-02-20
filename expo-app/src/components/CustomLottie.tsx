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

const { width, height } = Dimensions.get("window");

type CustomLottieProps = {
  type?: "default" | "fullscreen";
  componentHeight?: number;
  isBlurView?: boolean;
  customSyle?: StyleProp<ViewStyle>;
};

const CustomLottie: React.FC<CustomLottieProps> = React.memo(
  ({ type = "default", componentHeight, isBlurView = true, customSyle }) => {
    const lottieSource = require("../../assets/Background.json");

    return (
      <View
        style={[
          styles.lottieContainer,
          customSyle,
          { height: componentHeight ?? height * 0.68 },
          type === "fullscreen" && styles.fullscreen,
        ]}
      >
        <LottieView
          source={lottieSource}
          autoPlay
          loop
          cacheComposition
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          hardwareAccelerationAndroid
          enableMergePathsAndroidForKitKatAndAbove
        />

        {isBlurView && (
          <BlurView style={styles.blurView} tint="light" intensity={60} />
        )}
      </View>
    );
  },
);
CustomLottie.displayName = "CustomLottie";

export default CustomLottie;

const styles = StyleSheet.create({
  lottieContainer: {
    width: width,
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
  fullscreen: {
    height: "100%",
    borderRadius: 0,
  },
});
