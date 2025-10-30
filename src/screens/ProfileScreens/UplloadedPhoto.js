import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Dimensions,
  ImageBackground,
} from "react-native";
import LottieView from "lottie-react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import UploadPhotoHeader from "../../component/headers/UploadPhotoHeader";
import CustomLottie from "../../component/CustomLottie";

const { width, height } = Dimensions.get("window");

const UplloadedPhoto = ({ navigation }) => {
  const navigateProfile = () => {
    navigation.navigate("UploadPhoto"); // Adjust "Profile" to your target screen name
  };

  return (
    <View style={styles.uploadPhoto}>
      <UploadPhotoHeader navigateProfile={navigateProfile} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.uploadTitle}>Upload your Profile Photo</Text>
          <Text style={styles.description}>
            Lorem Ipsum has been the industry's standard dummy text ever since
            the 1500s, when an unknown printer took a galley of type and
            scrambled it to make a type specimen book.
          </Text>
          <View style={styles.uploadOptions}>
            <View style={styles.uploadButton}>
              <ImageBackground
                style={{
                  height: "100%",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                source={ImagesAssets.cardimg}
              >
                <Image
                  style={{
                    height: 80,
                    width: 80,
                    borderRadius: 50,
                    marginTop: "9%",
                  }}
                  source={ImagesAssets.cardimg}
                />
                <TouchableOpacity
                  style={styles.replacebutton}
                  onPress={() => { }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Text style={styles.buttonText}>Replace</Text>
                  </View>
                </TouchableOpacity>
              </ImageBackground>
            </View>

            <Text style={styles.orText}>or</Text>
            <TouchableOpacity style={styles.cameraButton} onPress={() => { }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
              >
                <Image
                  style={{ height: 18, width: 18, marginVertical: 8 }}
                  source={ImagesAssets.camra_icon}
                />
                <Text style={styles.buttonText}>Open Camera</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Card with Lottie Animation */}
        <View style={styles.bottomCard}>
          {/* <LottieView
            source={require("../../assets/Background.json")}
            autoPlay
            loop
            style={styles.lottieBackground}
          /> */}
          <CustomLottie />
          <TouchableOpacity style={styles.submitButton} onPress={() => { }}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  uploadPhoto: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#262626",
    textAlign: "left",
    marginBottom: 10,
    fontFamily: "WhyteInktrap-Bold",
    lineHeight: 25,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#636363",
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
  },
  uploadOptions: {
    alignItems: "center",
    marginVertical: "10%",
    zIndex: 5,
  },
  uploadButton: {
    width: "100%",

    borderRadius: 35,
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    alignItems: "center",
    marginBottom: 15,
    height: "47%",
    justifyContent: "center",
    overflow: "hidden",
  },
  uploadButtonContent: {
    alignItems: "center",
  },
  orText: {
    fontSize: 14,
    color: "#636363",
    marginTop: "3%",
    fontFamily: "Poppins-Regular",
  },
  cameraButton: {
    width: "100%",
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#e6ebe9",
    alignItems: "center",
    marginTop: "10%",
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    zIndex: 2,
  },
  replacebutton: {
    width: "92%",
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#e6ebe9",
    alignItems: "center",
    marginTop: "3%",
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    zIndex: 2,
  },
  buttonText: {
    fontSize: 12,
    color: Colors.black,
    fontFamily: "WhyteInktrap-Bold",
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
  },
  lottieBackground: {
    position: "absolute",
    width: width, // Full screen width
    height: height * 0.5, // Adjusted for the bottom card's height
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
});

export default UplloadedPhoto;
