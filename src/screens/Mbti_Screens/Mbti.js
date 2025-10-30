import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import { BlurView } from "@react-native-community/blur";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const MBTI = (props) => {
  const scrollViewRef = useRef(null);
  const [userDetails, setUserDetails] = useState(null);

  // Fetch userDetails from AsyncStorage
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDetailsString = await AsyncStorage.getItem("userDetails");
        if (userDetailsString) {
          const parsedDetails = JSON.parse(userDetailsString);
          console.log("userDetails:", parsedDetails); // Console log for debugging
          setUserDetails(parsedDetails);
        }
      } catch (error) {
        console.log("Failed to load user details:", error);
      }
    };

    fetchUserDetails();

    scrollViewRef.current?.scrollTo({ y: 100, animated: true });
  }, []);

  const handleStart = () => {
    if (userDetails?.department === "Shore_Staff") {
      props.navigation.replace("HelperLanding");
    } else {
      props.navigation.replace("Mbti_Start_Test");
    }
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={{ backgroundColor: "#fff", flex: 1 }}>
        <Image
          style={styles.illustrativeAlbedoDepictA4Icon}
          resizeMode="cover"
          source={ImagesAssets.Mbti_img_2}
        />
        <Image
          style={styles.whatsappImage20241004At2}
          resizeMode="cover"
          source={ImagesAssets.Mbti_img_1}
        />
        <View style={[styles.mbtiItem, styles.mbtiPosition]}>
          <BlurView
            style={styles.blurView}
            blurType="dark"
            blurAmount={20}
            reducedTransparencyFallbackColor="rgba(27, 26, 26,1)"
          />
          <View style={[styles.ads, styles.adsFlexBox]}>
            <Text style={[styles.imJollieYour, styles.button1Layout]}>
              Welcome aboard! I’m Jollie — your SeaBuddy {"\n\n"}
              Out at sea, it’s easy to feel cut off. That’s why I’m here — to keep you connected, check
              in on your mood, and bring you crew events, content, and real-time support (yes, even a
              live helpline from Sailors’ Society)
            </Text>
          </View>
          <Image
            style={[styles.mbtiInner, styles.iconLayout]}
            resizeMode="cover"
            source={ImagesAssets.Mbti_line}
          />
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <View style={styles.stateLayer}>
              <Text style={[styles.button1, styles.button1Layout]}>
                Let's Get Started!
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    height: screenHeight < 1000 ? "auto" : "100%",
  },
  blurView: {
    height: "100%", // Fill the height of the parent container
    width: "100%", // Fill the width of the parent container
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
  mbtiBg: {
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  mbtiPosition: {
    width: "100%",
    left: 0,
    position: "absolute",
  },
  iconLayout: {
    maxHeight: "100%",
    position: "absolute",
  },
  adsFlexBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  button1Layout: {
    lineHeight: 21,
    fontSize: 14,
  },
  ads: {
    position: "absolute",
    bottom: "23%",
    borderRadius: 16,
    padding: 14,
    justifyContent: "center",
    width: "90%",
    marginHorizontal: "5%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: "7%",
  },
  mbtiChild: {
    backgroundColor: "rgba(224, 224, 224, 0.6)",
    height: 674,
    top: 0,
    left: 0,
  },
  illustrativeAlbedoDepictA4Icon: {
    top: "19%",
    left: "13%",
    width: "70%",
    height: "55%",
    position: "absolute",
  },
  whatsappImage20241004At2: {
    top: "7%",
    left: "52%",
    width: "42%",
    height: "20%",
    position: "absolute",
  },
  mbtiItem: {
    bottom: 0,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    height: "50%",

    position: "relative",
    overflow: "hidden", // Ensure the blur effect doesn't overflow
  },
  imJollieYour: {
    fontFamily: "Poppins-Regular",
    color: "#fff",
    flex: 1,
  },
  mbtiInner: {
    bottom: "93%",
    left: "30%",
    width: "40%",
    height: 7,
    borderRadius: 25,
  },
  button1: {
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#06361f",
    textAlign: "center",
  },
  stateLayer: {
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    position: "absolute",
    bottom: "5%",
    zIndex: 5,
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#fff",
    width: "90%",
    marginHorizontal: "5%",
  },
  mbti: {
    width: "100%",
    height: "80%",
    overflow: "hidden",
    flex: 1,
  },
});

export default MBTI;
