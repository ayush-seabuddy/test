import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../../statusbar/FocusAwareStatusBar";
import { Colors } from "react-native/Libraries/NewAppScreen";
import AntDesign from 'react-native-vector-icons/AntDesign';
import PersonalityResultInfoPopup from "../../../screens/PersonalityMapInfoPopup";

const JolliHeader = ({ navigation, title }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const getPopupContent = () => {
    if (title === "Marine Buddy") {
      return (
        <Text style={styles.popupText}>
          This chatbot provides general information based on ship manuals and available references.
          It is not a substitute for professional maritime judgment, official regulations, or
          instructions from vessel management or port authorities. Always confirm critical
          decisions with your company’s policies, technical manuals, and qualified personnel.
          Seabuddy accepts no liability for actions taken solely on the basis of this chatbot’s responses.
        </Text>
      );
    }
    if (title === "Health Buddy") {
      return (
        <Text style={styles.popupText}>
          This chatbot provides general health and wellness information only. It is not medical
          advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare
          professional with any questions you may have about a medical condition. Never disregard
          professional medical advice because of something provided here. If you experience a
          medical emergency, call for immediate assistance. Seabuddy does not assume liability
          for outcomes related to chatbot use.
        </Text>
      );
    }
    return (
      <Text style={styles.popupText}>
        This chatbot offers general spiritual reflections and supportive conversation.
        It is not a substitute for personal faith practice, professional counseling, or
        formal religious guidance. Views expressed are generated and not affiliated with
        any specific tradition. Use discretion and consult trusted leaders or advisors for
        personal matters. Seabuddy is not responsible for decisions made based on this content.
      </Text>
    );
  };

  return (
    <>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.health}>
          {title.length > 25 ? `${title.slice(0, 25)}...` : title}
        </Text>

        {/* Info Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.headerButton}
        >
          <View style={styles.iconBackground}>
            <AntDesign name="infocirlce" size={22} color="gray" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Info Popup */}
      <PersonalityResultInfoPopup
        visible={modalVisible}
        setModalVisible={setModalVisible}
        screenName={'JollyAI'}
        content={
          <>
            {getPopupContent()}
          </>
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    zIndex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: { elevation: 5 },
    }),
  },
  health: {
    fontSize: 24,
    lineHeight: 29,
    marginTop: 2,
    fontFamily: "WhyteInktrap-Medium",
    color: "rgba(38, 38, 38, 1)",
  },
  headerButton: {
    marginLeft: 10,
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  iconBackground: {
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#262626",
  },
  popupText: {
    fontSize: 10,
    lineHeight: 20,
    color: "#444",
    marginBottom: 12,
    fontFamily: 'Poppins-Regular'
  },
});

export default JolliHeader;
