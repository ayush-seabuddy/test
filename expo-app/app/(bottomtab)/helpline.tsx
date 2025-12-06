import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import { useTranslation } from "react-i18next";
import CustomLottie from "@/src/components/CustomLottie";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import Colors from "@/src/utils/Colors";
import { History, Home } from "lucide-react-native";
import HelplineAndAICards from "@/src/components/HelplineComponent/HelplineCard";
import AIJollieCard from "@/src/components/HelplineComponent/AIJollieCard";

const { width, height } = Dimensions.get("window");

const HelplineScreen = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <Text style={styles.title}>{t("helplines")}</Text>
        <TouchableOpacity style={styles.historyButton}>
          <History size={21} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton}>
          <Home size={21} color="#000" />
        </TouchableOpacity>
      </View>

      <Image
        style={styles.illustrativeIcon}
        resizeMode="contain"
        source={ImagesAssets.HelplineJollie}
      />

      <View style={styles.backgroundImage}>
        <CustomLottie isBlurView={false} componentHeight={height * 0.9} />
      </View>

      <View style={styles.cardContainer}>
        <HelplineAndAICards />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 16,
    position: "relative",
  },
  title: {
    fontSize: 20,
    lineHeight: 25,
    color: "#262626",
    fontWeight: "500",
    fontFamily: "WhyteInktrap-Medium",
  },
  historyButton: {
    position: "absolute",
    right: 62,
    backgroundColor: "#B0DB0266",
    padding: 6,
    borderRadius: 10,
  },
  homeButton: {
    position: "absolute",
    right: 10,
    backgroundColor: "#B0DB0266",
    padding: 6,
    borderRadius: 10,
  },
  illustrativeIcon: {
    width: "100%",
    height: "35%",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    top: height * 0.35,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  cardContainer: {
    position: "absolute",
    top: "28%",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "rgba(185,185,185,0.5)",
    borderRadius: 25,
    padding: 16,
  },
});

export default HelplineScreen;