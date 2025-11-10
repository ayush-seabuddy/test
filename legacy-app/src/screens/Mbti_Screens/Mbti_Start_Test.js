import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  Pressable,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import { BlurView } from "@react-native-community/blur";
import { ImagesAssets } from "../../assets/ImagesAssets";
const { width, height } = Dimensions.get("screen");
import AntDesign from 'react-native-vector-icons/AntDesign';
import { Alert } from "react-native";
import PersonalityResultInfoPopup from "../PersonalityMapInfoPopup";
import { useRoute } from "@react-navigation/native";

const Mbti_Start_Test = ({ props, navigation }) => {
  const scrollViewRef = useRef(null);
   const route = useRoute();
  const isRequired = route.params?.showPopup ?? false;
  console.log("route.params: ", route.params);
  console.log("isRequired: ", isRequired);
  const [modalVisible, setModalVisible] = React.useState(false);
  useEffect(() => {
    // This will scroll the view to a specific y-coordinate, e.g., 100 pixels down
    scrollViewRef.current?.scrollTo({ y: 100, animated: true });

    // Alternatively, you can scroll to the end:
    // scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);
  return (

    <View style={[styles.mbti, styles.mbtiBg]}>
      <View
        style={{
          fontSize: 20,
          padding: 20,
          backgroundColor: "transparent",
          position: "absolute",
          zIndex: 5,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 20,
              lineHeight: 22,
              color: "#161616",
              fontFamily: "WhyteInktrap-Bold",
            }}
          >
            Personality Map
          </Text>

          {/* Icon Button */}
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <AntDesign name="infocirlce" size={20} color="black" />
          </TouchableOpacity>

          {/* Popup Modal */}
          <PersonalityResultInfoPopup
            visible={modalVisible}
            setModalVisible={setModalVisible}
            text=" This quick test helps me understand how you think, feel, and connect — so I can guide
            you better on board. You’ll learn things about yourself most people go their whole lives
            not knowing. And trust me — when you do know, life (and crew life) just makes a whole
            lot more sense."
          />
        </View>
      </View>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      <View style={[styles.mbtiChild, styles.mbtiPosition]} />

      <Image
        style={styles.illustrativeAlbedoDepictA4Icon}
        resizeMode="cover"
        source={ImagesAssets.Mbti_test_img}
      />

      <View style={[styles.mbtiItem, styles.mbtiPosition]}>
        {/* <BlurView
          style={StyleSheet.absoluteFill}
          blurType=""
          blurAmount={10}
          //   reducedTransparencyFallbackColor="white"
        /> */}
      </View>

      {/* Centered Ads Section */}


      <Text style={styles.heading}>
        Alright, before we dive in, let's figure out what really drives you!
      </Text>

      <View style={styles.ads1}>
        <Text style={[styles.imJollieYour, styles.button1Layout]}>
          Discover how your unique traits shape the way you think, feel and work!
        </Text>
      </View>

      <View style={styles.ads_2}>
        <Text style={[styles.imJollieYour, styles.button1Layout]}>
          Learn how your personality type influences many areas of your life.
        </Text>
      </View>
      <View style={styles.ads_3}>
        <Text style={[styles.imJollieYour, styles.button1Layout]}>
          Your responses are private and used only to support your well-being.
        </Text>
      </View>

      <Image
        style={[styles.mbtiInner, styles.iconLayout]}
        resizeMode="cover"
        source={ImagesAssets.Mbti_line}
      />

      {/* Centered Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.replace("Mbti_Test_2", { from: "Mbti_Start_Test" , isRequired });
        }}
      >
        <View style={styles.stateLayer}>
          <Text style={[styles.button1, styles.button1Layout]}>Let's begin!</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  blurView: {
    height: "100%", // Fill the height of the parent container
    width: "100%", // Fill the width of the parent container
    borderRadius: 10, // Optional: round the corners
  },

  button1Layout: {
    fontSize: 14,
  },
  // ads: {
  //   position: "absolute",
  //   bottom: "47%",
  //   // padding: 12,
  //   padding: height * 0.0125,
  //   borderRadius: 16,
  //   paddingVertical: 17,

  //   width: "90%", // Set a width that fits the layout
  //   marginHorizontal: "5%", // Center the ads section
  //   backgroundColor: "rgba(0, 0, 0, 0.6)",
  // },
  heading: {
    position: "absolute",
    bottom: "47%",
    // padding: 12,
    padding: height * 0.0125,
    borderRadius: 16,
    paddingVertical: 17,
    color: 'white',
    width: "90%", // Set a width that fits the layout
    marginHorizontal: "5%", // Center the ads section
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold'
  },
  ads1: {
    position: "absolute",
    bottom: "36%",
    // padding: 12,
    padding: height * 0.0125,
    borderRadius: 16,
    paddingVertical: 17,

    width: "90%", // Set a width that fits the layout
    marginHorizontal: "5%", // Center the ads section
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },

  ads_2: {
    position: "absolute",
    bottom: "25%",
    // padding: 12,
    padding: height * 0.0125,
    borderRadius: 16,
    paddingVertical: 17,

    width: "90%", // Set a width that fits the layout
    marginHorizontal: "5%", // Center the ads section
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  ads_3: {
    position: "absolute",
    bottom: "14%",
    paddingVertical: 17,
    borderRadius: 16,
    // padding: 14,
    padding: height * 0.013,

    // justifyContent: "center",
    width: "90%", // Set a width that fits the layout
    marginHorizontal: "5%", // Center the ads section
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  mbtiChild: {
    borderBottomRightRadius: 48,
    borderBottomLeftRadius: 48,
    backgroundColor: "rgba(224, 224, 224, 0.6)",
    height: "95%",
    top: 0,
    left: 0,
  },
  illustrativeAlbedoDepictA4Icon: {
    top: "7%",
    left: "15%",
    width: "55%",
    height: "48%",
    position: "absolute",
  },

  mbtiItem: {
    top: "40%",
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    height: "65%",
    backgroundColor: "rgba(0, 0, 0, 0.77)",
    position: "relative",
    overflow: "hidden",
  },
  imJollieYour: {
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },
  mbtiInner: {
    top: "41%",
    left: 124,
    width: 140,
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
    alignItems: "center", // Center the button text
  },
  button: {
    position: "absolute",
    bottom: "5%",

    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: "center",

    backgroundColor: "#FFFFFF",
    width: "90%", // Set a width that fits the layout
    marginHorizontal: "5%", // Center the button
  },
  mbti: {
    width: "100%",
    height: 844,
    overflow: "hidden",
    flex: 1,
  },
});

export default Mbti_Start_Test;
