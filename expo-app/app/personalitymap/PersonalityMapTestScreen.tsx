import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import GlobalButton from "@/src/components/GlobalButton";
import { Info } from "lucide-react-native";



const { width, height } = Dimensions.get("window");

const PersonalityMapIntroScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("personality_map")}</Text>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Info size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <Image
        style={styles.heroImage}
        resizeMode="contain"
        source={ImagesAssets.personalityMapJollie}
      />

      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.heading}>{t("heading")}</Text>

        <View style={styles.benefitCard}>
          <Text style={styles.benefitText}>{t("benefit_1")}</Text>
        </View>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitText}>{t("benefit_2")}</Text>
        </View>
        <View style={styles.benefitCard}>
          <Text style={styles.benefitText}>{t("benefit_3")}</Text>
        </View>

        <GlobalButton
          title={t("start_button")}
          onPress={() =>
          {
            
          }
          }
          buttonStyle={styles.customButton}
          textStyle={styles.customButtonText}
        />
      </View>

      {/* Info Popup */}
      {/* <PersonalityResultInfoPopup
        visible={modalVisible}
        setModalVisible={setModalVisible}
        text={t("info_popup_text")}
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    position: "absolute",
    top: height * 0.06,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "WhyteInktrap-Bold",
    color: Colors.textPrimary,
  },
  heroImage: {
    position: "absolute",
    top: height * 0.1,
    left: width * 0.15,
    width: width * 0.7,
    height: height * 0.4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    top: height * 0.45,
    backgroundColor: "rgba(0, 0, 0, 0.77)",
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.05,
  },
  heading: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: Colors.white,
    textAlign: "center",
    marginBottom: height * 0.03,
  },
  benefitCard: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: height * 0.02,
    borderRadius: 16,
    marginBottom: height * 0.015,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: Colors.white,
    textAlign: "center",
  },
  customButton: {
    backgroundColor: Colors.buttonWhiteBg,
    height: 50,
    marginTop: height * 0.02,
  },
  customButtonText: {
    color: Colors.buttonWhiteText,
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
});

export default PersonalityMapIntroScreen;