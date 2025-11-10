import CustomLottie from "@/src/components/CustomLottie";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { height } = Dimensions.get("window");

type CaptainAnimatedLayoutProps = {
  children?: React.ReactNode;
  loading?: boolean;
};

const CaptainAnimatedLayout: React.FC<CaptainAnimatedLayoutProps> = ({ children, loading = false }) => {
  const translateY = useRef(new Animated.Value(150)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  return (
    <View style={styles.container}>
      {/* Background Animation */}
      <CustomLottie componetHeight={height * 0.5} isBlurView={false} />

      {/* Captain Illustration */}
      <Animated.Image
        source={ImagesAssets.splashCaptainImage}
        style={[styles.captainImg, { transform: [{ translateY }] }]}
      />

      {/* Children (Login / Signup Form) */}
      <View style={styles.bottomCard}>
        {children}
      </View>
    </View>
  );
};

export default CaptainAnimatedLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.captainanimatedlayoutbg,
  },
  captainImg: {
    position: "absolute",
    top: 30,
    alignSelf: "center",
    height: 250,
    width: 220,
    resizeMode: "contain",
  },
  bottomCard: {
    marginTop: height * 0.38,
  },
});
