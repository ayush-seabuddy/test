import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import HelpLineHeader from "../../component/headers/HelpLineScreensHeader/HelpLineHeader";
import HelpLineCard from "../../component/Cards/HelpLineScreensCards/HelpLineCard";
import EmergencyModal from "../../component/Modals/EmergencyModal";
import CustomLottie from "../../component/CustomLottie";
const { width, height } = Dimensions.get("window");

const HelpLine = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.container}>
      <HelpLineHeader navigation={navigation} />
      <EmergencyModal
        navigation={navigation}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <Image
            style={{ width: "47%", height: "32%", marginVertical: "25%" }}
            resizeMode="cover"
            source={ImagesAssets.helpline_img}
          />
        </View>
        <View
          style={{
            position: "absolute",
            flex: 1,
            width: "100%",
            paddingHorizontal: 16,
            top: "43%",
          }}
        >
          <HelpLineCard
            navigation={navigation}
            setModalVisible={setModalVisible}
          />
        </View>
        <View style={styles.bottomCard}>
          {/* <LottieView
            source={require("../../assets/Background.json")}
            autoPlay
            loop
            style={styles.lottieBackground}
          /> */}
          <CustomLottie />
        </View>
      </ScrollView>
      <View style={{ marginLeft: 9 }}>
        {/* <Text style={styles.loremIpsumIsSimply}>
          Lorem Ipsum is simply dummy text of the printing .
        </Text> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    zIndex: 0,
    top: "20%",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,

    alignItems: "center",
  },
  bottomCard: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    alignItems: "center",
    position: "absolute",
    height: "50%",
    bottom: 0,
    overflow: "hidden",
    paddingHorizontal: 16,
    zIndex: -1,
  },
  lottieBackground: {
    position: "absolute",
    width: width,
    height: height * 0.5,
    bottom: 0,
  },
  submitButton: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#02130b",
    alignItems: "center",
    marginTop: "75%",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
  loremIpsumIsSimply: {
    position: "absolute",
    bottom: "20%",
    left: "5%",
    fontSize: 10,
    lineHeight: 14,
    fontFamily: "Poppins-Regular",
    color: "#949494",
    paddingBottom: 10,
  },
});

export default HelpLine;
