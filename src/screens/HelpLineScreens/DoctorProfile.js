import * as React from "react";
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
import DoctorProfileHeader from "../../component/headers/HelpLineScreensHeader/DoctorProfileHeader";
import DoctorProfileCard from "../../component/Cards/HelpLineScreensCards/DoctorProfileCard";
import DoctorCalendarCard from "../../component/Cards/HelpLineScreensCards/DoctorCalendarCard";
import CustomLottie from "../../component/CustomLottie";
import FastImage from "react-native-fast-image";
import MediaPreviewModal from "../../component/Modals/MediaPreviewModal";

const { width, height } = Dimensions.get("window");

const DoctorProfile = ({ navigation, route }) => {
  const { item } = route?.params;
  const [data, setData] = React.useState(item);
  const [selectedMedia, setSelectedMedia] = React.useState({});
  const [mediaModalVisible, setMediaModalVisible] = React.useState(false);

  const handleMediaPress = (uri) => {
    setSelectedMedia({ uri, isVideo: false });
    setMediaModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Add view button for image preview */}
      <TouchableOpacity
        onPress={() => {
          handleMediaPress(data?.profileUrl)
        }}
        style={{
          padding: 3,
          borderRadius: 10,
          backgroundColor: "#D9D9D9",
          position: "absolute",
          right: 15,
          top: 80,
          zIndex: 30,
          padding: 10
        }}
      >
        <Image
          style={{ height: 15, width: 15, padding: 10 }}
          source={ImagesAssets.ViewIcon}
        />
      </TouchableOpacity>

      <DoctorProfileHeader navigation={navigation} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={styles.overlay} />
      <View style={styles.contentContainer}>
        <View style={{
          backgroundColor: "#D9D9D9", height: "35%", width: "100%", borderBottomRightRadius: 32,
          borderBottomLeftRadius: 32,
        }} />

        <FastImage
          style={{
            width: "100%",
            height: "40%",
            position: "absolute",
            borderBottomRightRadius: 32,
            borderBottomLeftRadius: 32,
          }}
          resizeMode="cover"
          source={{
            uri: data?.profileUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
          }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ position: "absolute", top: "21.5%", paddingHorizontal: 16, flex: 1, height: "80%" }}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 80 }}
        >
          <DoctorProfileCard data={data} />
        </ScrollView>

        <View
          style={{
            paddingHorizontal: 16,
            width: "100%",
            position: "absolute",
            bottom: "4%",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("AppointmentForm", {
                data: data,
              });
            }}
            style={[styles.button, styles.buttonFlexBox]}
          >
            <View style={[styles.stateLayer, styles.buttonFlexBox]}>
              <Text style={styles.button1}>Book an appointment</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* <View style={styles.bottomCard}>
        <CustomLottie />
      </View> */}

      {/* Media Preview Modal */}
      {selectedMedia && <MediaPreviewModal
        visible={mediaModalVisible}
        onClose={() => setMediaModalVisible(false)}
        uri={selectedMedia.uri}
        type={'image'} // or "video"
      />}
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
    alignItems: "center",
  },
  bottomCard: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    alignItems: "center",
    position: "absolute",
    height: "55%",
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
  buttonFlexBox: {
    justifyContent: "center",
    alignSelf: "stretch",
  },
  button1: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    textAlign: "center",
  },
  stateLayer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    shadowColor: "rgba(103, 110, 118, 0.08)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 5,
    elevation: 5,
    shadowOpacity: 1,
    borderRadius: 8,
    backgroundColor: "#02130b",
    width: "100%",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backgroundImage: {
    width: "100%",
    height: Dimensions.get("window").height * 0.42,
    position: "absolute",
    top: "7%",
    left: 0,
    right: 0,
    zIndex: -1, // Ensures it stays behind the content
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
  },
});

export default DoctorProfile;