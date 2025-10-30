import LottieView from "lottie-react-native"
import { BlurView } from "@react-native-community/blur";
import React from "react";
import { Dimensions, Platform, StyleSheet } from "react-native";
import Colors from "../colors/Colors";
const { width, height } = Dimensions.get("window");

const CustomLottie = ({ type = 'default' | 'fullscreen', componetHeight, isBlurView = true, customSyle }) => {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors.white,
            // overflow: "hidden",
        },
        lottieBackground: {
            width: width * 1,
            height: componetHeight ? componetHeight : height * 0.68,
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            position: "absolute",
            bottom: "0%",

        },
        lottieBackgroundIos: {
            width: width * 1,
            height: componetHeight ? componetHeight : height * 0.68,
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            position: "absolute",
            bottom: "0%",
        },

        blurView: {
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

    return (
        <>
            {
                Platform.OS === 'ios' ? <>
                    <LottieView
                        source={require("../assets/Background.json")}
                        autoPlay
                        loop
                        resizeMode="cover"
                        style={[customSyle ? customSyle : type === 'fullscreen' ? { height: "100%" } : styles.lottieBackgroundIos]}
                        hardwareAccelerationAndroid={true}
                        enableMergePathsAndroidForKitKatAndAbove={true}
                    />
                    {isBlurView &&
                        <BlurView
                            style={styles.blurView}
                            blurType="light" // Options: 'light', 'dark', 'xlight' (iOS only)
                            blurAmount={10} // Adjust blur intensity (0-100)
                            reducedTransparencyFallbackColor="white" // Fallback for accessibility
                        />
                    }
                </> :
                    <LottieView
                        source={require("../assets/Background.json")}
                        autoPlay
                        loop
                        resizeMode="cover"
                        style={[customSyle ? customSyle : (type === 'fullscreen' ? { height: "100%" } : styles.lottieBackground)]}
                    />
            }
        </>
    )
}



export default CustomLottie;